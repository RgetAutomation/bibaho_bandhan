// hooks/useMessages.ts

import { useState, useEffect, useCallback } from "react";
import { Logger } from "./utils/logger";
import { useSocket } from "./helper/SocketContext";
import { AxiosResponse } from "./utils/AxiosResponse";
import {
  ISAChat,
  ISAChatMessage,
  ISAChatParticipant,
  RoleConversationType,
} from "./interface/ITeam";
import axios from "axios";
import { useNotificationStore } from "@/hooks/useNotificationStore";

export const useTeamMessages = (convId: string, currentUser: string) => {
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<ISAChatMessage[]>([]);
  const [participants, setParticipants] = useState<ISAChatParticipant | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { sockets, isConnected } = useSocket();
  const teamSASocket = sockets["/teamtosa"];
  const {
    removeAdminConversation,
    removeModeratorConversation,
    removeGhotokConversation,
  } = useNotificationStore();

  // Start or get conversation
  const startConversation = useCallback(async () => {
    if (!convId) return;

    setIsLoading(true);
    try {
      const messagesResponse = await axios.get<AxiosResponse<ISAChat>>(
        `/api/conversation/details/${convId}`
      );
      const messagesData = messagesResponse.data.data;
      Logger.info(messagesData);

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
  }, [convId, teamSASocket]);

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!teamSASocket) return;
      const messageData = {
        conversationId,
        content,
      };

      // Optimistically add message to UI immediately
      const tempMessage: ISAChatMessage = {
        id: `temp-${Date.now()}`,
        content,
        senderTeamId: currentUser || "",
        conversationId: conversationId || "",
        status: "SENT",
        createdAt: new Date(),
        type: RoleConversationType.SUPERADMIN_ADMIN,
      };

      setMessages((prev) => [...prev, tempMessage]);

      teamSASocket.emit("send-team-to-sa-message", messageData);
    },
    [teamSASocket, currentUser, conversationId]
  );

  // Handle real-time messages
  useEffect(() => {
    if (!teamSASocket || !isConnected || !conversationId) return;

    const handleNewMessage = (message: ISAChatMessage) => {
      // Check if this message belongs to current conversation
      Logger.info("New message", message);

      const isRelevantMessage =
        (message.senderTeamId === currentUser ||
          message.senderTeamId === participants?.id) &&
        message.conversationId === conversationId;

      if (isRelevantMessage) {
        setMessages((prev: ISAChatMessage[]) => {
          // Remove temporary message if exists and add the real one
          const filtered = prev.filter((msg) => !msg.id.startsWith("temp-"));
          return [...filtered, message];
        });
      }

      if (message.type === RoleConversationType.SUPERADMIN_ADMIN) {
        removeAdminConversation(conversationId);
      }
      if (message.type === RoleConversationType.SUPERADMIN_MODERATOR) {
        removeModeratorConversation(conversationId);
      }
      if (message.type === RoleConversationType.SUPERADMIN_GHOTOK) {
        removeGhotokConversation(conversationId);
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

    const handleRemoveNotification = (message: ISAChatMessage) => {
      if (message.type === RoleConversationType.SUPERADMIN_ADMIN) {
        removeAdminConversation(message.conversationId);
      }
      if (message.type === RoleConversationType.SUPERADMIN_MODERATOR) {
        removeModeratorConversation(message.conversationId);
      }
      if (message.type === RoleConversationType.SUPERADMIN_GHOTOK) {
        removeGhotokConversation(message.conversationId);
      }
    };

    teamSASocket.on("new-team-to-sa-message", handleNewMessage);
    teamSASocket.on("new-team-to-sa-message:notify", handleRemoveNotification);

    return () => {
      teamSASocket.off("new-team-to-sa-message", handleNewMessage);
      teamSASocket.off(
        "new-team-to-sa-message:notify",
        handleRemoveNotification
      );
    };
  }, [
    teamSASocket,
    isConnected,
    conversationId,
    currentUser,
    participants?.id,
    removeAdminConversation,
    removeModeratorConversation,
    removeGhotokConversation,
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
