// hooks/useMessages.ts

import api from "@/lib/axiosInstance";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./helper/system/SocketContext";
import { AxiosResponse } from "@/types/AxiosResponse";
import {
  IGhotokUserConversation,
  IGhotokUserConversationMessage,
  IGhotokUserConversationUser,
} from "./interface/ghotok/IGhotokUserConversation";
import { MessageStatus } from "@prisma/client";
import { useGhotokNotificationStore } from "@/hooks/ghotok/useGhotokNotificationStore";
import { Gender } from "@/types/groom";
import { da } from "date-fns/locale";

export const useGhotokUserMessages = (
  conversationId: string,
  ghotokId: string
) => {
  const [messages, setMessages] = useState<IGhotokUserConversationMessage[]>(
    []
  );
  const [participants, setParticipants] = useState<
    IGhotokUserConversationUser[] | null
  >(null);
  const [participant, setParticipant] =
    useState<IGhotokUserConversationUser | null>(null);
  const [myParticipant, setMyParticipant] =
    useState<IGhotokUserConversationUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { sockets, isConnected } = useSocket();
  const teamUserSocket = sockets["/teamuser"];

  const { removeBrideConversation, removeGroomConversation } =
    useGhotokNotificationStore();

  const readSentRef = useRef<Set<string>>(new Set());

  // Start or get conversation
  const startConversation = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      // Fetch messages for this conversation
      if (conversationId) {
        const messagesResponse = await api.get<
          AxiosResponse<IGhotokUserConversation>
        >(`/conversations/ghotok/user/conversation/${conversationId}/details`);

        const messagesData = messagesResponse.data.data;
        const selectMyUser = messagesData.participants.find(
          (participant) => participant.ghotokId === ghotokId
        );
        const selectParticipant = messagesData.participants.find(
          (participant) => participant.ghotokId !== ghotokId
        );
        setParticipant(selectParticipant || null);
        setMyParticipant(selectMyUser || null);
        setParticipants(messagesData.participants || null);
        setMessages(messagesData.messages || []);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, ghotokId]);

  // Send message
  const joinConversation = useCallback(
    async (conversationId: string) => {
      if (!conversationId || !teamUserSocket) return;

      teamUserSocket.emit("join-ghotok-user-active-conversations", {
        conversationId,
      });
    },
    [teamUserSocket]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!teamUserSocket || !participant?.id) return;
      const messageData = {
        conversationId,
        senderId: myParticipant?.id,
        receiverId: participant?.id,
        content,
      };

      // Optimistically add message to UI immediately
      const tempMessage: IGhotokUserConversationMessage = {
        id: `temp-${Date.now()}`,
        content,
        senderId: myParticipant?.id || "",
        receiverId: participant?.id || "",
        conversationId: conversationId || "",
        status: "PENDING",
        createdAt: new Date(),
        moderation: null,
      };

      setMessages((prev) => [...prev, tempMessage]);

      teamUserSocket.emit("send-ghotok-user-message", messageData);
    },
    [teamUserSocket, participant?.id, myParticipant?.id, conversationId]
  );

  // Handle real-time messages
  useEffect(() => {
    if (!teamUserSocket || !isConnected || !conversationId) return;

    joinConversation(conversationId);

    const handleNewMessage = (message: IGhotokUserConversationMessage) => {
      // Check if this message belongs to current conversation
      const isRelevantMessage =
        // (message.senderTeamId === currentUserId ||
        //   message.senderUserId === participants?.id) &&
        message.conversationId === conversationId;

      if (isRelevantMessage) {
        // setMessages((prev: IMessage[]) => {
        //   const filtered = prev.filter((msg) => !msg.id.startsWith("temp-"));
        //   return [...filtered, message];
        // });
        setMessages((prev: IGhotokUserConversationMessage[]) => {
          // 1️⃣ Replace temp message
          if (message.tempId) {
            const filtered = prev.filter((msg) => !msg.id.startsWith("temp-"));
            return [...filtered, message];
          }
          // 2️⃣ If message already exists → UPDATE (do NOT append)
          const exists = prev.some((m) => m.id === message.id);
          if (exists) {
            return prev.map((m) =>
              m.id === message.id ? { ...m, ...message } : m
            );
          }

          // 3️⃣ Otherwise → append
          return [...prev, message];
        });

        if (message.receiverGender === Gender.FEMALE)
          removeBrideConversation(message.conversationId);
        if (message.receiverGender === Gender.MALE)
          removeGroomConversation(message.conversationId);

        // addBrideConversation(message.receiverId, message.conversationId);
        // addGroomConversation(message.receiverId, message.conversationId);
      }
    };

    const handleSendMessageStatus = (
      message: IGhotokUserConversationMessage
    ) => {
      setMessages((prev: IGhotokUserConversationMessage[]) => {
        const filtered = prev.filter((msg) => !msg.id.startsWith("temp-"));
        return [...filtered, message];
      });
    };

    const handleMessageStatusUpdate = (data: {
      id: string;
      conversationId: string;
      senderId: string;
      receiverId: string;
      content: string;
      createdAt: string;
      status: MessageStatus;
      moderation: {
        status: string;
        reason: string;
      } | null;
    }) => {
      const status = data.status;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.id
            ? ({
                ...msg,
                status,
                moderation: data.moderation
                  ? {
                      status: data.moderation?.status,
                      reason: data.moderation?.reason,
                    }
                  : null,
              } as IGhotokUserConversationMessage)
            : msg
        )
      );
    };

    // STATUS UPDATE (DELIVERED / READ)
    const onStatusUpdate = (data: { messageId: string; status: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId ? { ...m, status: data.status } : m
        )
      );
    };

    teamUserSocket.on("ghotok-send-message", handleSendMessageStatus);
    teamUserSocket.on("ghotok-user-new-message", handleNewMessage);
    teamUserSocket.on("message-delivery-status", handleMessageStatusUpdate);
    teamUserSocket.on("message-mark-read", onStatusUpdate);

    return () => {
      teamUserSocket.off("ghotok-send-message", handleSendMessageStatus);
      teamUserSocket.off("ghotok-user-new-message", handleNewMessage);
      teamUserSocket.off("message-delivery-status", handleMessageStatusUpdate);
      teamUserSocket.off("message-mark-read", onStatusUpdate);
    };
  }, [
    teamUserSocket,
    isConnected,
    conversationId,
    myParticipant?.id,
    joinConversation,
    participant?.id,
    removeBrideConversation,
    removeGroomConversation,
    //addBrideConversation,
    //addGroomConversation,
  ]);

  useEffect(() => {
    if (!teamUserSocket || !participant?.id) return;

    const unreadIds = messages
      .filter(
        (m) =>
          m.receiverId === myParticipant?.id &&
          m.senderId === participant.id &&
          m.status !== MessageStatus.READ &&
          !m.id.startsWith("temp-") &&
          !readSentRef.current.has(m.id)
      )
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      unreadIds.forEach((id) => readSentRef.current.add(id));

      // Mark as read
      teamUserSocket.emit("ghotok-user-mark-as-read", {
        messageIds: unreadIds,
        conversationId,
      });
    }
  }, [
    messages,
    teamUserSocket,
    participant?.id,
    myParticipant?.id,
    conversationId,
  ]);

  return {
    participants,
    participant,
    myParticipant,
    messages,
    isLoading,
    sendMessage,
    startConversation,
  };
};
