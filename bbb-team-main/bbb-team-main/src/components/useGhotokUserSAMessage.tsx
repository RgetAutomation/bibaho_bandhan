// hooks/useMessages.ts

import { useState, useEffect, useCallback, useRef } from "react";
import {
  IGhotokUserSaChat,
  IGhotokUserSAMessage,
} from "./interface/ghotok/IGhotokSaChat";
import { useSocket } from "./helper/system/SocketContext";
import { useGhotokNotificationStore } from "@/hooks/ghotok/useGhotokNotificationStore";
import { AxiosResponse } from "@/types/AxiosResponse";
import { Logger } from "./utils/logger";
import api from "@/lib/axiosInstance";
import { MessageStatus } from "@prisma/client";

interface MessagePayload {
  id: string;
  conversationId: string;
  userId: string;
  type: "TEXT" | "PAYMENT";
  content: string;
  price?: number;
}

export const useGhotokUserSAMessages = (
  conversationId: string,
  currentUserId: string
) => {
  const [participantId, setParticipantId] = useState<string>("");
  const [messages, setMessages] = useState<IGhotokUserSAMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { sockets, isConnected } = useSocket();
  const teamSASocket = sockets["/sauser"];
  const { removeMatchingUserConversation } = useGhotokNotificationStore();
  const readSentRef = useRef<Set<string>>(new Set());

  // Start or get conversation
  const startConversation = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      const messagesResponse = await api.get<AxiosResponse<IGhotokUserSaChat>>(
        `/app/ghotok/matching/users/conversations/${conversationId}`
      );
      const messagesData = messagesResponse.data.data;
      setParticipantId(messagesData.userId || "");
      setMessages(messagesData.messages || []);
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const emitMessage = useCallback(
    (payload: MessagePayload, tempMessage: IGhotokUserSAMessage) => {
      setMessages((prev) => [...prev, tempMessage]);
      teamSASocket?.emit("user-superadmin-chat:send", payload);
    },
    [teamSASocket]
  );

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!teamSASocket || !participantId) return;
      const tempId = `temp-${Date.now()}`;

      const messageData: MessagePayload = {
        id: tempId,
        conversationId,
        content,
        userId: participantId,
        type: "TEXT",
      };

      // Optimistically add message to UI immediately
      const tempMessage: IGhotokUserSAMessage = {
        id: tempId,
        type: "TEXT",
        content,
        senderId: currentUserId || "",
        conversationId: conversationId || "",
        status: "PENDING",
        createdAt: new Date(),
      };

      emitMessage(messageData, tempMessage);
    },
    [teamSASocket, conversationId, participantId, currentUserId, emitMessage]
  );

  const rejectPayment = useCallback(
    async (messageId: string) => {
      if (!teamSASocket) return;
      teamSASocket.emit("user-superadmin-chat:payment-reject", {
        messageId,
        conversationId,
      });
    },
    [teamSASocket, conversationId]
  );

  // Handle real-time messages
  useEffect(() => {
    if (!teamSASocket || !isConnected || !conversationId) return;

    teamSASocket.emit("user-superadmin-chat:join", {
      conversationId,
    });

    const handleNewMessage = (message: IGhotokUserSAMessage) => {
      // Check if this message belongs to current conversation
      //Logger.info("New message", message);

      const isRelevantMessage = message.conversationId === conversationId;

      if (isRelevantMessage) {
        setMessages((prev: IGhotokUserSAMessage[]) => {
          // Remove temporary message if exists and add the real one
          const filtered = prev.filter((msg) => !msg.id.startsWith("temp-"));
          return [...filtered, message];
        });
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
      Logger.info("Message status update", {
        messageId,
        status,
        paymentPhase,
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? ({ ...msg, paymentPhase, status } as IGhotokUserSAMessage)
            : msg
        )
      );
    };

    const handleNotification = (data: string) => {
      removeMatchingUserConversation(data);
    };

    teamSASocket.on("user-superadmin-chat:new-message", handleNewMessage);
    teamSASocket.on(
      "user-superadmin-chat:message-status-update",
      handleMessageStatusUpdate
    );

    teamSASocket.on("user-superadmin-chat:notification", handleNotification);

    return () => {
      teamSASocket.off("user-superadmin-chat:new-message", handleNewMessage);
      teamSASocket.off(
        "user-superadmin-chat:message-status-update",
        handleMessageStatusUpdate
      );
      teamSASocket.off("user-superadmin-chat:notification", handleNotification);
    };
  }, [
    teamSASocket,
    isConnected,
    conversationId,
    participantId,
    removeMatchingUserConversation,
  ]);

  /* -------------------------------------------
       AUTO MARK AS READ (REALTIME)
    -------------------------------------------- */
  useEffect(() => {
    if (!teamSASocket || !participantId) return;

    const unreadIds = messages
      .filter(
        (m) =>
          m.senderId !== participantId &&
          m.status !== MessageStatus.READ &&
          !m.id.startsWith("temp-") &&
          !readSentRef.current.has(m.id)
      )
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      unreadIds.forEach((id) => readSentRef.current.add(id));

      // Mark as read
      teamSASocket.emit("user-superadmin-chat:read", {
        messageIds: unreadIds,
        conversationId: conversationId,
        userId: participantId,
      });
    }
  }, [messages, teamSASocket, participantId, conversationId]);

  return {
    participantId,
    messages,
    isLoading,
    conversationId,
    sendMessage,
    startConversation,
    rejectPayment,
  };
};
