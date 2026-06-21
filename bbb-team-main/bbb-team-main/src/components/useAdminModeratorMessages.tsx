// hooks/useMessages.ts

import api from "@/lib/axiosInstance";
import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./helper/system/SocketContext";
import { AxiosResponse } from "@/types/AxiosResponse";
import { ITemplate } from "./interface/ITemplate";
import { IMessage } from "./interface/IMessage";
import { IChat, IChatParticipants } from "./interface/IChat";
import { useModeratorNotificationStore } from "@/hooks/moderator/useModeratorNotificationStore";

export const useAdminModeratorMessages = (
  conversationId: string,
  currentUserId: string
) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [participants, setParticipants] = useState<IChatParticipants | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { sockets, isConnected } = useSocket();
  const adminModeratorSocket = sockets["/adminmoderator"];
  const { removeAdminModeratorConversation } = useModeratorNotificationStore();

  // Start or get conversation
  const startConversationForAdminWithModerator = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      // Fetch messages for this conversation
      if (conversationId) {
        const messagesResponse = await api.get<AxiosResponse<IChat>>(
          `/conversations/admin/moderator/conversation/${conversationId}/details`
        );
        const messagesData = messagesResponse.data.data;

        setParticipants(messagesData.participant);
        setMessages(messagesData.messages || []);
        setTemplates(messagesData.templates || []);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const startConversationForModeratorWithAdmin = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      // Fetch messages for this conversation
      if (conversationId) {
        const messagesResponse = await api.get<AxiosResponse<IChat>>(
          `/conversations/admin/moderator/conversation/${conversationId}/details`
        );
        const messagesData = messagesResponse.data.data;

        setParticipants(messagesData.participant);
        setMessages(messagesData.messages || []);
        setTemplates(messagesData.templates || []);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Send message

  const sendMessage = useCallback(
    async (templateId: string, content: string) => {
      if (!adminModeratorSocket || !participants?.id) return;
      const messageData = {
        conversationId,
        templateId,
      };

      // Optimistically add message to UI immediately
      const tempMessage: IMessage = {
        id: `temp-${Date.now()}`,
        content,
        templateId,
        senderTeamId: currentUserId,
        conversationId: conversationId || "",
        status: "SENT",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, tempMessage]);

      adminModeratorSocket.emit("send-team-message", messageData);
    },
    [adminModeratorSocket, participants?.id, currentUserId, conversationId]
  );

  // Handle real-time messages
  useEffect(() => {
    if (!adminModeratorSocket || !isConnected || !conversationId) return;

    adminModeratorSocket.emit("join-admin-moderator-active-conversations", {
      conversationId,
    });

    const handleNewMessage = (message: IMessage) => {
      // Check if this message belongs to current conversation
      const isRelevantMessage =
        (message.senderTeamId === currentUserId ||
          message.senderTeamId === participants?.id) &&
        message.conversationId === conversationId;

      if (isRelevantMessage) {
        setMessages((prev: IMessage[]) => {
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
    const handleRemoveNotification = (data: { conversationId: string }) => {
      removeAdminModeratorConversation(data.conversationId);
    };

    adminModeratorSocket.on("new-team-message", handleNewMessage);
    adminModeratorSocket.on(
      "admin-moderator-message:notification",
      handleRemoveNotification
    );

    return () => {
      adminModeratorSocket.off("new-team-message", handleNewMessage);
      adminModeratorSocket.off(
        "admin-moderator-message:notification",
        handleRemoveNotification
      );
    };
  }, [
    adminModeratorSocket,
    isConnected,
    conversationId,
    currentUserId,
    participants?.id,
    removeAdminModeratorConversation,
  ]);

  return {
    participants,
    messages,
    templates,
    isLoading,
    conversationId,
    sendMessage,
    startConversationForAdminWithModerator,
    startConversationForModeratorWithAdmin,
  };
};
