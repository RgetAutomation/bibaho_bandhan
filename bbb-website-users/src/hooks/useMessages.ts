// hooks/useMessages.ts
import { useSocket } from "@/components/contexts/SocketContext";
import { MessageStatus } from "@/components/enum/messageStatus";
import { IMessage, IMessageSet } from "@/components/interface/IMessage";
import { Logger } from "@/components/utils/logger";
import { useEffect, useCallback, useRef } from "react";
import { useNotificationStore } from "./useNotificationStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";
import { IChatParticipant } from "@/components/interface/IChat";
import { AxiosResponse } from "@/components/interface/AxiosResponse";

export const useMessages = (conversationId: string, currentUserId: string) => {
  const {
    data: participantData,
    isLoading: isLoadingParticipant,
    isError: isErrorParticipant,
  } = useQuery({
    queryKey: ["participants", conversationId],
    queryFn: async () => {
      const response = await api.get<AxiosResponse<IChatParticipant>>(
        `/users/conversations/${conversationId}/details`,
      );
      return response.data;
    },
    enabled: !!conversationId,
  });

  const participant = participantData?.data;

  const { sockets, isConnected } = useSocket();
  const socket = sockets["/"];
  //const teamUserSocket = sockets["/teamuser"];

  //const readSentRef = useRef<Set<string>>(new Set());
  const { removeConversation } = useNotificationStore();

  /* -------------------------------------------
     SOCKET ROOM JOIN
  -------------------------------------------- */
  useEffect(() => {
    if (!socket || !isConnected || !conversationId) return;

    socket.emit("join-conversation", conversationId);
    //Logger.info("Joined conversation:", conversationId);

    return () => {
      socket.emit("leave-conversation", conversationId);
    };
  }, [socket, isConnected, conversationId]);

  const queryClient = useQueryClient();
  // Send message
  // const sendMessage = useCallback(
  //   async (content: string) => {
  //     if (!socket || !content.trim() || !participant?.id) return;
  //     const tempId = `temp-${Date.now()}`;
  //     const messageData = {
  //       content: content.trim(),
  //       receiverId: participant?.id,
  //       conversationId,
  //       id: tempId,
  //     };

  //     // Optimistically add message to UI immediately
  //     const tempMessage: IMessageSet = {
  //       id: tempId,
  //       content: content.trim(),
  //       senderId: currentUserId,
  //       receiverId: participant?.id,
  //       conversationId: conversationId || "",
  //       status: MessageStatus.PENDING,
  //       createdAt: new Date(),
  //       moderation: null,
  //     };

  //     // 🔥 Optimistically update TanStack cache
  //     queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
  //       if (!oldData) return oldData;

  //       const newPages = [...oldData.pages];
  //       newPages[0].messages = [...newPages[0].messages, tempMessage];

  //       return { ...oldData, pages: newPages };
  //     });

  //     socket.emit("send-message", messageData);
  //   },
  //   [socket, participant?.id, currentUserId, conversationId, queryClient],
  // );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!socket || !content.trim() || !participant?.id) return;

      const tempId = `temp-${Date.now()}`;

      const tempMessage: IMessage = {
        id: tempId,
        content: content.trim(),
        senderId: currentUserId,
        receiverId: participant.id,
        conversationId,
        status: MessageStatus.PENDING,
        createdAt: new Date(),
        moderation: null,
      };

      queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
        if (!oldData) return oldData;

        const newPages = [...oldData.pages];

        // ✅ always update newest page (index 0)
        newPages[0] = {
          ...newPages[0],
          messages: [tempMessage, ...newPages[0].messages],
        };

        return {
          ...oldData,
          pages: newPages,
        };
      });

      socket.emit("send-message", {
        content: content.trim(),
        receiverId: participant.id,
        conversationId,
        id: tempId, // IMPORTANT
      });
    },
    [socket, participant?.id, currentUserId, conversationId, queryClient],
  );

  /* -------------------------------------------
     RECEIVE REALTIME EVENTS
  -------------------------------------------- */
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onNewMessage = (message: IMessage) => {
      Logger.info("New message received:", message);
      // Check if this message belongs to current conversation
      // const isRelevantMessage =
      //   (message.senderId === currentUserId &&
      //     message.receiverId === participants?.id) ||
      //   (message.senderId === participants?.id &&
      //     message.receiverId === currentUserId);
      const isRelevantMessage = message.conversationId === conversationId;
      if (isRelevantMessage) {
        // setMessages((prev: IMessage[]) => {
        //   const filtered = prev.filter((msg) => !msg.id.startsWith("temp-"));
        //   return [...filtered, message];
        // });
        // setMessages((prev: IMessage[]) => {
        //   // 1️⃣ Replace temp message
        //   if (message.tempId) {
        //     const filtered = prev.filter((msg) => !msg.id.startsWith("temp-"));
        //     return [...filtered, message];
        //   }
        //   // 2️⃣ If message already exists → UPDATE (do NOT append)
        //   const exists = prev.some((m) => m.id === message.id);
        //   if (exists) {
        //     return prev.map((m) =>
        //       m.id === message.id ? { ...m, ...message } : m,
        //     );
        //   }

        //   // 3️⃣ Otherwise → append
        //   return [...prev, message];
        // });
        queryClient.setQueryData(
          ["messages", conversationId],
          (oldData: any) => {
            if (!oldData) return oldData;

            let messageReplaced = false;

            const newPages = oldData.pages.map((page: any, index: number) => {
              // Only modify newest page
              if (index !== 0) return page;

              const updatedMessages = page.messages.map((m: IMessage) => {
                // Replace temp
                if (
                  m.id.startsWith("temp-") &&
                  m.content === message.content &&
                  m.senderId === message.senderId
                ) {
                  messageReplaced = true;
                  return message;
                }

                // Update existing
                if (m.id === message.id) {
                  messageReplaced = true;
                  return { ...m, ...message };
                }

                return m;
              });

              // If not replaced and not existing → ADD IT
              if (!messageReplaced) {
                updatedMessages.unshift(message); // because you reverse in UI
              }

              return {
                ...page,
                messages: updatedMessages,
              };
            });

            return {
              ...oldData,
              pages: newPages,
            };
          },
        );

        removeConversation(message.conversationId);
      }
    };

    // STATUS UPDATE (DELIVERED / READ)
    // const onStatusUpdate = ({
    //   messageId,
    //   status,
    // }: {
    //   messageId: string;
    //   status: MessageStatus;
    // }) => {
    //   Logger.info("Message status updated:", messageId, status);

    //   queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
    //     if (!oldData) return oldData;

    //     const updatedPages = oldData.pages.map((page: any) => ({
    //       ...page,
    //       messages: page.messages.map((m: IMessage) =>
    //         m.id === messageId ? { ...m, status } : m,
    //       ),
    //     }));

    //     return { ...oldData, pages: updatedPages };
    //   });
    // };

    const onStatusUpdate = ({
      messageId,
      status,
    }: {
      messageId: string;
      status: MessageStatus;
    }) => {
      queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
        if (!oldData) return oldData;

        const updatedPages = oldData.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((m: IMessage) =>
            m.id === messageId ? { ...m, status } : m,
          ),
        }));

        return { ...oldData, pages: updatedPages };
      });
    };

    const onMessageModerationUpdate = (data: any) => {
      const { id, status, moderation } = data;

      queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
        if (!oldData) return oldData;

        const updatedPages = oldData.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((m: IMessage) =>
            m.id === id
              ? {
                  ...m,
                  status,
                  moderation: moderation
                    ? {
                        status: moderation.status,
                        reason: moderation.reason,
                      }
                    : null,
                }
              : m,
          ),
        }));

        return { ...oldData, pages: updatedPages };
      });
    };

    const onGhotokNewMessage = (message: IMessage) => {
      // queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
      //   if (!oldData) return oldData;

      //   const updatedPages = [...oldData.pages];

      //   // Remove temp messages
      //   updatedPages[0].messages = updatedPages[0].messages.filter(
      //     (m: IMessage) => !m.id.startsWith("temp-"),
      //   );

      //   // Add real message
      //   updatedPages[0].messages.push(message);

      //   return { ...oldData, pages: updatedPages };
      // });
      queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
        if (!oldData) return oldData;

        let messageReplaced = false;

        const newPages = oldData.pages.map((page: any, index: number) => {
          // Only modify newest page
          if (index !== 0) return page;

          const updatedMessages = page.messages.map((m: IMessage) => {
            // Replace temp
            if (
              m.id.startsWith("temp-") &&
              m.content === message.content &&
              m.senderId === message.senderId
            ) {
              messageReplaced = true;
              return message;
            }

            // Update existing
            if (m.id === message.id) {
              messageReplaced = true;
              return { ...m, ...message };
            }

            return m;
          });

          // If not replaced and not existing → ADD IT
          if (!messageReplaced) {
            updatedMessages.unshift(message); // because you reverse in UI
          }

          return {
            ...page,
            messages: updatedMessages,
          };
        });

        return {
          ...oldData,
          pages: newPages,
        };
      });
    };

    socket.on("new-message", onNewMessage);
    socket.on("message-status-update", onStatusUpdate);
    socket.on("message-mark-read", onStatusUpdate);
    socket.on("ghotok-user-new-message", onGhotokNewMessage);
    socket.on("message-delivery-status", onMessageModerationUpdate);
    //socket.on("moderation-message-updated", onMessageModerationUpdate);

    return () => {
      socket.off("new-message", onNewMessage);
      socket.off("message-status-update", onStatusUpdate);
      socket.off("message-mark-read", onStatusUpdate);
      socket.off("ghotok-user-new-message", onGhotokNewMessage);
      socket.off("message-delivery-status", onMessageModerationUpdate);
      //socket.off("moderation-message-updated", onMessageModerationUpdate);
    };
  }, [socket, isConnected, conversationId, removeConversation, queryClient]);

  /* -------------------------------------------
     AUTO MARK AS READ (REALTIME)
  -------------------------------------------- */
  // useEffect(() => {
  //   if (!socket || !participant?.id || !teamUserSocket) return;

  //   const selectedUser = participant;

  //   const unreadIds = messages
  //     .filter(
  //       (m) =>
  //         m.receiverId === currentUserId &&
  //         m.senderId === participant?.id &&
  //         m.status !== MessageStatus.READ &&
  //         !m.id.startsWith("temp-") &&
  //         !readSentRef.current.has(m.id),
  //     )
  //     .map((m) => m.id);

  //   if (unreadIds.length > 0) {
  //     unreadIds.forEach((id) => readSentRef.current.add(id));

  //     // This is for when chat with direct user
  //     if (!selectedUser.isGhotokOwned) {
  //       socket.emit("mark-as-read", {
  //         messageIds: unreadIds,
  //         conversationId,
  //         receiverId: selectedUser.id,
  //       });
  //     }

  //     // This is for when chat with ghotok user
  //     if (selectedUser.isGhotokOwned) {
  //       teamUserSocket.emit("ghotok-user-mark-as-read", {
  //         messageIds: unreadIds,
  //         conversationId,
  //       });
  //     }
  //   }
  // }, [
  //   messages,
  //   socket,
  //   teamUserSocket,
  //   participant,
  //   currentUserId,
  //   conversationId,
  // ]);

  return {
    participant,
    isLoadingParticipant,
    isErrorParticipant,
    conversationId,
    sendMessage,
  };
};
