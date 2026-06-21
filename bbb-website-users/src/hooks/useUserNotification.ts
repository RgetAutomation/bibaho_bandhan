"use client";

import { useEffect } from "react";
import { useSocket } from "@/components/contexts/SocketContext";
import { useNotificationStore } from "./useNotificationStore";
import { IMessage } from "@/components/interface/IMessage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getConversations } from "@/actions/usersChats";
import { UserType } from "@/components/enum/userType";
import { IConversation } from "@/components/interface/IConversation";

export const useUserNotification = (userId: string, userType: UserType) => {
  const { sockets } = useSocket();
  const socket = sockets["/"];
  const queryClient = useQueryClient();

  const {
    userConversationIds,
    addConversation,
    removeConversation,
    resetUserMessage,
    teamConversationIds,
    resetTeamMessage,
  } = useNotificationStore();

  const {
    data: allConversations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(),
    enabled: userType !== UserType.FREE_USER && !!userId,
  });

  //const { activeConversationId } = useChatUIStore();

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (newMessage: IMessage) => {
      // Update the conversation cache
      queryClient.setQueryData(
        ["conversations"],
        (oldData: IConversation[] | undefined) => {
          if (!oldData) return oldData;

          return oldData.map((conv) => {
            if (conv.id === newMessage.conversationId) {
              const isOwnMessage = newMessage.senderId === userId;
              return {
                ...conv,
                unreadCount: isOwnMessage ? (conv.unreadCount ?? 0) : (conv.unreadCount ?? 0) + 1,
                lastMessage: newMessage,
              };
            }
            return conv;
          });
        },
      );

      if (newMessage.senderId !== userId) {
        addConversation(newMessage.conversationId);
      }
    };

    socket.on("new-message", handleNewMessage);
    socket.on("ghotok-user-new-message", handleNewMessage);

    // Reset unread count when messages are marked as read by the server
    const handleMessagesRead = (data: { conversationId: string }) => {
      queryClient.setQueryData(
        ["conversations"],
        (oldData: IConversation[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((conv) =>
            conv.id === data.conversationId
              ? { ...conv, unreadCount: 0 }
              : conv,
          );
        },
      );
    };

    socket.on("messages-marked-read", handleMessagesRead);
    socket.on("ghotok-messages-marked-read", handleMessagesRead);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("ghotok-user-new-message", handleNewMessage);
      socket.off("messages-marked-read", handleMessagesRead);
      socket.off("ghotok-messages-marked-read", handleMessagesRead);
    };
  }, [socket, addConversation, queryClient]);

  return {
    userConvCount: userConversationIds.length,
    removeConversation,
    resetUserMessage,
    teamMessageCount: teamConversationIds.length,
    resetTeamMessage,
    //startConversation,
    isLoading,
    error,
    allConversations,
  };
};
