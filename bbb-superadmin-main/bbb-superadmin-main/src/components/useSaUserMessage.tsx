// hooks/useMessages.ts

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./helper/SocketContext";
import { AxiosResponse } from "./utils/AxiosResponse";
import axios from "axios";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import {
  ISaUserConversation,
  ISaUserMessage,
  ISaUserParticipant,
} from "./interface/ISaUserChat";
import { Logger } from "./utils/logger";
import { IBrideProfileForChat } from "./interface/IUsers";

interface MessagePayload {
  conversationId: string;
  userId: string;
  type: "TEXT" | "PAYMENT" | "PROFILE";
  content: string;
  price?: number;
  reportId?: string;
  paymentPhase?: string;
}

export const useSaUserMessages = (convId: string, currentUser: string) => {
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<ISaUserMessage[]>([]);
  const [participant, setParticipant] = useState<ISaUserParticipant | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { sockets, isConnected } = useSocket();
  const teamSASocket = sockets["/sauser"];
  const {
    removeAdminConversation,
    removeModeratorConversation,
    removeGhotokConversation,
    removeUserSAConversation,
  } = useNotificationStore();

  // Start or get conversation
  const startConversation = useCallback(async () => {
    if (!convId) return;

    setIsLoading(true);
    try {
      const messagesResponse = await axios.get<
        AxiosResponse<ISaUserConversation>
      >(`/api/conversation/sauser/${convId}`);
      const messagesData = messagesResponse.data.data;

      setConversationId(messagesData.id);
      setParticipant(messagesData.participant);
      setMessages(messagesData.messages || []);
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [convId]);

  const emitMessage = useCallback(
    (payload: MessagePayload, tempMessage: ISaUserMessage) => {
      setMessages((prev) => [...prev, tempMessage]);
      teamSASocket?.emit("user-superadmin-chat:send", payload);
    },

    [teamSASocket]
  );

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!teamSASocket || !participant?.id) return;
      const messageData: MessagePayload = {
        conversationId,
        content,
        userId: participant.id,
        type: "TEXT",
      };

      // Optimistically add message to UI immediately
      const tempMessage: ISaUserMessage = {
        id: `temp-${Date.now()}`,
        type: "TEXT",
        content,
        senderId: currentUser || "",
        conversationId: conversationId || "",
        status: "PENDING",
        createdAt: new Date(),
      };

      emitMessage(messageData, tempMessage);
    },
    [teamSASocket, participant?.id, conversationId, currentUser, emitMessage]
  );

  const sendPaymentMessage = useCallback(
    async (price: string, content: string, reportId: string) => {
      if (!teamSASocket || !participant?.id) return;
      const messageData: MessagePayload = {
        conversationId,
        userId: participant.id,
        type: "PAYMENT",
        content: content,
        price: Number(price),
        reportId,
        paymentPhase: "PENDING",
      };

      // Optimistically add message to UI immediately
      const tempMessage: ISaUserMessage = {
        id: `temp-${Date.now()}`,
        type: "PAYMENT",
        content: content,
        senderId: currentUser || "",
        conversationId,
        paymentPhase: "PENDING",
        price: Number(price),
        status: "PENDING",
        createdAt: new Date(),
      };

      emitMessage(messageData, tempMessage);
    },
    [teamSASocket, participant?.id, conversationId, currentUser, emitMessage]
  );

  const sendProfileMessage = useCallback(
    async (bride: IBrideProfileForChat) => {
      if (!teamSASocket || !participant?.id) return;
      const messageContent = `${bride.publicId};${bride.title} ${bride.lastName};${bride.avatar}`;
      const messageData: MessagePayload = {
        conversationId,
        userId: participant.id,
        type: "PROFILE",
        content: messageContent,
      };

      // Optimistically add message to UI immediately
      const tempMessage: ISaUserMessage = {
        id: `temp-${Date.now()}`,
        type: "PROFILE",
        content: messageContent,
        senderId: currentUser || "",
        conversationId,
        status: "PENDING",
        createdAt: new Date(),
      };

      emitMessage(messageData, tempMessage);
    },
    [teamSASocket, participant?.id, conversationId, currentUser, emitMessage]
  );

  // Handle real-time messages
  useEffect(() => {
    if (!teamSASocket || !isConnected || !conversationId) return;

    teamSASocket.emit("user-superadmin-chat:join", {
      conversationId,
    });

    const handleNewMessage = (message: ISaUserMessage) => {
      // Check if this message belongs to current conversation
      //console.log("New message", message);

      const isRelevantMessage = message.conversationId === conversationId;

      if (isRelevantMessage) {
        setMessages((prev: ISaUserMessage[]) => {
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
            ? ({ ...msg, paymentPhase, status } as ISaUserMessage)
            : msg
        )
      );
    };

    const handleNotification = (data: string) => {
      removeUserSAConversation(data);
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
    currentUser,
    participant?.id,
    removeAdminConversation,
    removeModeratorConversation,
    removeGhotokConversation,
    removeUserSAConversation,
  ]);

  return {
    participant,
    messages,
    isLoading,
    conversationId,
    sendMessage,
    sendPaymentMessage,
    sendProfileMessage,
    startConversation,
  };
};
