// hooks/useMessages.ts

import api from "@/lib/axiosInstance";
import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./helper/system/SocketContext";
import { AxiosResponse } from "@/types/AxiosResponse";
import {
  ISAChat,
  ISAChatMessage,
  ISAChatParticipant,
} from "./interface/ISAChat";
import { Logger } from "./utils/logger";
import { useTeamSANotificationStore } from "@/hooks/useTeamSANotificationStore";

export const useTeamMessages = (userId: string) => {
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<ISAChatMessage[]>([]);
  const [participants, setParticipants] = useState<ISAChatParticipant | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { sockets, isConnected } = useSocket();
  const teamSASocket = sockets["/teamtosa"];

  const { resetTeamHeadMessage } = useTeamSANotificationStore();

  // Start or get conversation
  const startConversation = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const messagesResponse = await api.get<AxiosResponse<ISAChat>>(
        `/conversations/sa/conversation`
      );
      const messagesData = messagesResponse.data.data;

      teamSASocket?.emit("join-team-to-sa-active-conversations", {
        conversationId: messagesData.id,
      });

      setConversationId(messagesData.id);
      setParticipants(messagesData.participants);
      setMessages(messagesData.messages || []);
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, teamSASocket]);

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!teamSASocket || !participants?.id) return;
      const messageData = {
        conversationId,
        content,
      };

      // Optimistically add message to UI immediately
      const tempMessage: ISAChatMessage = {
        id: `temp-${Date.now()}`,
        content,
        senderTeamId: userId || "",
        conversationId: conversationId || "",
        status: "SENT",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, tempMessage]);

      teamSASocket.emit("send-team-to-sa-message", messageData);
    },
    [teamSASocket, participants?.id, userId, conversationId]
  );

  // Handle real-time messages
  useEffect(() => {
    if (!teamSASocket || !isConnected || !conversationId) return;

    const handleNewMessage = (message: ISAChatMessage) => {
      // Check if this message belongs to current conversation
      Logger.info("New message", message);

      const isRelevantMessage =
        (message.senderTeamId === userId ||
          message.senderTeamId === participants?.id) &&
        message.conversationId === conversationId;

      if (isRelevantMessage) {
        setMessages((prev: ISAChatMessage[]) => {
          // Remove temporary message if exists and add the real one
          const filtered = prev.filter((msg) => !msg.id.startsWith("temp-"));
          return [...filtered, message];
        });
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

    const handleMessageNotification = () => {
      resetTeamHeadMessage();
    };

    teamSASocket.on("new-team-to-sa-message", handleNewMessage);
    teamSASocket.on("new-team-to-sa-message:notify", handleMessageNotification);

    return () => {
      teamSASocket.off("new-team-to-sa-message", handleNewMessage);
      teamSASocket.off(
        "new-team-to-sa-message:notify",
        handleMessageNotification
      );
      //socket.off("message-status-update", handleMessageStatusUpdate);
    };
  }, [
    teamSASocket,
    isConnected,
    conversationId,
    userId,
    participants?.id,
    resetTeamHeadMessage,
  ]);

  return {
    participants,
    messages,
    isLoading,
    conversationId,
    sendMessage,
    startConversation,
  };
};
