// hooks/useMessages.ts

import api from "@/lib/axiosInstance";
import { useState, useEffect, useCallback } from "react";
import {
  ITeamUserChat,
  ITeamUserChatParticipant,
  ITeamUserMessage,
} from "./interface/ITeamUserChat";
//import { useTeamUserSocket } from "./contexts/UserTeamSocketContext";
import { AxiosResponse } from "./interface/AxiosResponse";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { Logger } from "./utils/logger";
import { useSocket } from "./contexts/SocketContext";

export const useTeamUserMessages = (
  conversationId: string,
  currentUserId: string,
) => {
  const [messages, setMessages] = useState<ITeamUserMessage[]>([]);
  const [participants, setParticipants] =
    useState<ITeamUserChatParticipant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { sockets, isConnected } = useSocket();
  const teamUserSocket = sockets["/teamuser"];

  const { removeTeamConversation } = useNotificationStore();

  // Start or get conversation
  const startConversation = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      // Fetch messages for this conversation
      if (conversationId) {
        const messagesResponse = await api.get<AxiosResponse<ITeamUserChat>>(
          `/users/user/team/conversation/${conversationId}/details`,
        );
        const messagesData = messagesResponse.data.data;

        setParticipants(messagesData.participant);
        setMessages(messagesData.messages || []);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Send message
  const joinConversation = useCallback(
    async (conversationId: string) => {
      if (!conversationId || !teamUserSocket) return;
      teamUserSocket.emit("join-team-user-conversations", {
        conversationId,
      });
    },
    [teamUserSocket],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!teamUserSocket || !participants?.id) return;
      const messageData = {
        conversationId,
        senderUserId: currentUserId,
        content,
        receiverId: participants.id,
      };

      // Optimistically add message to UI immediately
      const tempMessage: ITeamUserMessage = {
        id: `temp-${Date.now()}`,
        content,
        senderTeamId: "",
        senderUserId: currentUserId,
        conversationId: conversationId || "",
        status: "SENT",
        type: "TEXT",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, tempMessage]);

      teamUserSocket.emit("send-team-user-message", messageData);
    },
    [teamUserSocket, participants?.id, currentUserId, conversationId],
  );

  const rejectPayment = useCallback(
    async (messageId: string) => {
      if (!teamUserSocket) return;
      teamUserSocket.emit("team-user-message:payment-reject", {
        messageId,
        conversationId,
      });
    },
    [teamUserSocket, conversationId],
  );

  // Handle real-time messages
  useEffect(() => {
    if (!teamUserSocket || !isConnected || !conversationId) return;

    joinConversation(conversationId);

    const handleNewMessage = (message: ITeamUserMessage) => {
      Logger.info("new-team-user-message", message);
      // Check if this message belongs to current conversation
      const isRelevantMessage =
        // (message.senderTeamId === currentUserId ||
        //   message.senderUserId === participants?.id) &&
        message.conversationId === conversationId;

      Logger.info("isRelevantMessage", isRelevantMessage);

      if (isRelevantMessage) {
        setMessages((prev: ITeamUserMessage[]) => {
          // Remove temporary message if exists and add the real one
          const filtered = prev.filter((msg) => !msg.id.startsWith("temp-"));
          return [...filtered, message];
        });

        Logger.info("removeTeamConversation", message.conversationId);
        removeTeamConversation(message.conversationId);
      }
    };

    // const handleMessageStatusUpdate = ({
    //   messageId,
    //   status,
    // }: {
    //   messageId: string;
    //   status: string;
    // }) => {
    //   setMessages((prev) =>
    //     prev.map((msg) =>
    //       msg.id === messageId ? ({ ...msg, status } as IMessage) : msg
    //     )
    //   );
    // };

    const handleUpdateMessage = ({
      messageId,
      status,
      paymentPhase,
    }: {
      messageId: string;
      status: string;
      paymentPhase: string;
    }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? ({ ...msg, status, paymentPhase } as ITeamUserMessage)
            : msg,
        ),
      );
    };

    const handleRemoveNotification = (message: ITeamUserMessage) => {
      removeTeamConversation(message.conversationId);
    };

    teamUserSocket.on("new-team-user-message", handleNewMessage);
    teamUserSocket.on("team-user-message:update", handleUpdateMessage);
    teamUserSocket.on("team-user-message:notify", handleRemoveNotification);

    return () => {
      teamUserSocket.off("new-team-user-message", handleNewMessage);
      teamUserSocket.off("team-user-message:update", handleUpdateMessage);
      teamUserSocket.off("team-user-message:notify", handleRemoveNotification);
    };
  }, [
    teamUserSocket,
    isConnected,
    conversationId,
    currentUserId,
    joinConversation,
    participants?.id,
    removeTeamConversation,
  ]);

  return {
    participants,
    messages,
    isLoading,
    sendMessage,
    startConversation,
    rejectPayment,
  };
};
