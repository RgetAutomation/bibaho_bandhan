// hooks/useMessages.ts

import api from "@/lib/axiosInstance";
import { useState, useEffect, useCallback, useRef } from "react";
import { AxiosResponse } from "./interface/AxiosResponse";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { ISAUserConversations, ISAUserMessage } from "./interface/ISAUserChat";
import { useSocket } from "./contexts/SocketContext";
import { MessageStatus } from "./enum/messageStatus";

export const useSAUserMessages = (currentUserId: string) => {
  const [messages, setMessages] = useState<ISAUserMessage[]>([]);
  const [conversation, setConversation] = useState<ISAUserConversations>();
  const [isLoading, setIsLoading] = useState(false);
  const { sockets, isConnected } = useSocket();
  const teamUserSocket = sockets["/sauser"];

  const readSentRef = useRef<Set<string>>(new Set());

  const { removeTeamConversation, removeUserSAConversation } =
    useNotificationStore();

  const fetchedRef = useRef(false);

  // Start or get conversation
  const startConversation = useCallback(async () => {
    if (!currentUserId || fetchedRef.current) return;
    fetchedRef.current = true;
    setIsLoading(true);
    try {
      const messagesResponse = await api.get<
        AxiosResponse<ISAUserConversations>
      >("/users/user/sa/conversation");
      const messagesData = messagesResponse.data.data;
      setConversation(messagesData);
      setMessages(messagesData.messages || []);
    } catch (error) {
      console.error("Error starting conversation:", error);
      fetchedRef.current = false; // Allow retry on failure if needed, though rate limit might still apply
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  // // Send message
  const joinConversation = useCallback(
    async (conversationId: string) => {
      if (!conversationId || !teamUserSocket) return;
      teamUserSocket.emit("user-superadmin-chat:join", {
        conversationId,
      });
    },
    [teamUserSocket],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const conversationId = conversation?.id;
      if (!teamUserSocket || !currentUserId || !conversationId) return;
      const messageData = {
        conversationId: conversationId,
        userId: currentUserId,
        content,
      };

      // Optimistically add message to UI immediately
      const tempMessage: ISAUserMessage = {
        id: `temp-${Date.now()}`,
        content,
        senderId: currentUserId,
        conversationId: conversationId || "",
        status: MessageStatus.SENT,
        createdAt: new Date(),
        type: "TEXT",
      };

      setMessages((prev) => [...prev, tempMessage]);

      teamUserSocket.emit("user-superadmin-chat:send", messageData);
    },
    [teamUserSocket, currentUserId, conversation?.id],
  );

  const rejectPayment = useCallback(
    async (messageId: string) => {
      if (!teamUserSocket) return;
      teamUserSocket.emit("user-superadmin-chat:payment-reject", {
        messageId,
        conversationId: conversation?.id,
      });
    },
    [teamUserSocket, conversation?.id],
  );

  // Handle real-time messages
  useEffect(() => {
    const conversationId = conversation?.id;
    if (!teamUserSocket || !isConnected || !conversationId) return;

    joinConversation(conversationId);

    const handleNewMessage = (message: ISAUserMessage) => {
      //Logger.info("new-team-user-message", message);
      // Check if this message belongs to current conversation
      const isRelevantMessage =
        // (message.senderTeamId === currentUserId ||
        //   message.senderUserId === participants?.id) &&
        message.conversationId === conversationId;

      if (isRelevantMessage) {
        setMessages((prev: ISAUserMessage[]) => {
          // Remove temporary message if exists and add the real one
          const filtered = prev.filter((msg) => !msg.id.startsWith("temp-"));
          return [...filtered, message];
        });
        removeTeamConversation(message.conversationId);
      }
    };

    const handleMessageStatusUpdate = ({
      messageId,
      status,
      paymentPhase,
    }: {
      messageId: string;
      status: string;
      paymentPhase?: string;
    }) => {
      // Logger.info("Message status update", {
      //   messageId,
      //   status,
      //   paymentStatus,
      // });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? ({ ...msg, paymentPhase, status } as ISAUserMessage)
            : msg,
        ),
      );
    };

    const handleNotification = (data: string) => {
      removeUserSAConversation(data);
    };

    teamUserSocket.on("user-superadmin-chat:new-message", handleNewMessage);
    teamUserSocket.on(
      "user-superadmin-chat:message-status-update",
      handleMessageStatusUpdate,
    );
    teamUserSocket.on("user-superadmin-chat:notification", handleNotification);

    return () => {
      teamUserSocket.off("user-superadmin-chat:new-message", handleNewMessage);
      teamUserSocket.off(
        "user-superadmin-chat:message-status-update",
        handleMessageStatusUpdate,
      );
      teamUserSocket.off(
        "user-superadmin-chat:notification",
        handleNotification,
      );
    };
  }, [
    teamUserSocket,
    isConnected,
    currentUserId,
    joinConversation,
    removeTeamConversation,
    removeUserSAConversation,
    conversation?.id,
  ]);

  /* -------------------------------------------
     AUTO MARK AS READ (REALTIME)
  -------------------------------------------- */
  useEffect(() => {
    if (!teamUserSocket || !currentUserId) return;

    const unreadIds = messages
      .filter(
        (m) =>
          m.senderId !== currentUserId &&
          m.status !== MessageStatus.READ &&
          !m.id.startsWith("temp-") &&
          !readSentRef.current.has(m.id),
      )
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      unreadIds.forEach((id) => readSentRef.current.add(id));

      // Mark as read
      teamUserSocket.emit("user-superadmin-chat:read", {
        messageIds: unreadIds,
        conversationId: conversation?.id,
        userId: currentUserId,
      });
    }
  }, [messages, teamUserSocket, currentUserId, conversation?.id]);

  return {
    messages,
    isLoading,
    sendMessage,
    rejectPayment,
    startConversation,
  };
};
