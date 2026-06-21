// hooks/useMessages.ts

import api from "@/lib/axiosInstance";
import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./helper/system/SocketContext";
import { AxiosResponse } from "@/types/AxiosResponse";
import {
  ITeamUserChat,
  ITeamUserChatParticipant,
  ITeamUserMessage,
} from "./interface/ITeamUserChat";
import { useModeratorNotificationStore } from "@/hooks/moderator/useModeratorNotificationStore";
import { Logger } from "./utils/logger";
import { useAdminNotificationStore } from "@/hooks/admin/useAdminNotificationStore";

export const useTeamUserMessages = (
  conversationId: string,
  currentUserId: string
) => {
  const [messages, setMessages] = useState<ITeamUserMessage[]>([]);
  const [participants, setParticipants] =
    useState<ITeamUserChatParticipant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { sockets, isConnected } = useSocket();
  const teamUserSocket = sockets["/teamuser"];

  const { removeBrideConversation } = useModeratorNotificationStore();
  const { removeGroomConversation } = useAdminNotificationStore();

  // Start or get conversation
  const startConversation = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      // Fetch messages for this conversation
      if (conversationId) {
        const messagesResponse = await api.get<AxiosResponse<ITeamUserChat>>(
          `/conversations/team/user/conversation/${conversationId}/details`
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
    [teamUserSocket]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!teamUserSocket || !participants?.id) return;
      const messageData = {
        conversationId,
        senderTeamId: currentUserId,
        type: "TEXT",
        content,
      };

      // Optimistically add message to UI immediately
      const tempMessage: ITeamUserMessage = {
        id: `temp-${Date.now()}`,
        content,
        senderTeamId: currentUserId,
        senderUserId: "",
        conversationId: conversationId || "",
        type: "TEXT",
        status: "SENT",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, tempMessage]);

      teamUserSocket.emit("send-team-user-message", messageData);
    },
    [teamUserSocket, participants?.id, currentUserId, conversationId]
  );

  const sendPaymentMessage = useCallback(
    async (
      planId: string,
      content: string,
      planTitle: string,
      planPrice: number,
      planDuration: number
    ) => {
      if (!teamUserSocket || !participants?.id) return;
      const messageData = {
        conversationId,
        senderTeamId: currentUserId,
        type: "PAYMENT",
        content: content,
        planId,
        paymentPhase: "PENDING",
      };

      // Optimistically add message to UI immediately
      const tempMessage: ITeamUserMessage = {
        id: `temp-${Date.now()}`,
        type: "PAYMENT",
        content: content,
        senderTeamId: currentUserId,
        senderUserId: "",
        conversationId,
        paymentPhase: "PENDING",
        planId: planId,
        planTitle,
        planPrice,
        planDuration,
        status: "PENDING",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, tempMessage]);
      teamUserSocket.emit("send-team-user-message", messageData);
      //emitMessage(messageData, tempMessage);
    },
    [teamUserSocket, participants?.id, conversationId, currentUserId]
  );

  // Handle real-time messages
  useEffect(() => {
    if (!teamUserSocket || !isConnected || !conversationId) return;

    joinConversation(conversationId);

    const handleNewMessage = (message: ITeamUserMessage) => {
      //Logger.info("New Message", message);
      // Check if this message belongs to current conversation
      const isRelevantMessage =
        // (message.senderTeamId === currentUserId ||
        //   message.senderUserId === participants?.id) &&
        message.conversationId === conversationId;

      if (isRelevantMessage) {
        setMessages((prev: ITeamUserMessage[]) => {
          // Remove temporary message if exists and add the real one
          const filtered = prev.filter((msg) => !msg.id.startsWith("temp-"));
          return [...filtered, message];
        });
      }
    };

    const handleRemoveNotification = (data: {
      conversationId: string;
      receiverGender: string;
    }) => {
      if (data?.receiverGender === "MALE") {
        removeGroomConversation(data.conversationId);
      }
      if (data?.receiverGender === "FEMALE") {
        removeBrideConversation(data.conversationId);
      }
    };

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
            : msg
        )
      );
    };

    teamUserSocket.on("new-team-user-message", handleNewMessage);
    teamUserSocket.on("team-and-user-message:notify", handleRemoveNotification);
    teamUserSocket.on("team-and-user-message:update", handleUpdateMessage);
    //socket.on("message-status-update", handleMessageStatusUpdate);

    return () => {
      teamUserSocket.off("new-team-user-message", handleNewMessage);
      teamUserSocket.off(
        "team-and-user-message:notify",
        handleRemoveNotification
      );
      teamUserSocket.off("team-and-user-message:update", handleUpdateMessage);
      //socket.off("message-status-update", handleMessageStatusUpdate);
    };
  }, [
    teamUserSocket,
    isConnected,
    conversationId,
    currentUserId,
    joinConversation,
    participants?.id,
    removeBrideConversation,
    removeGroomConversation,
  ]);

  return {
    participants,
    messages,
    isLoading,
    sendMessage,
    sendPaymentMessage,
    startConversation,
  };
};
