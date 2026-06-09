// src/services/SocketService.js
import { Server as SocketIOServer } from "socket.io";
import { RedisService } from "./RedisService.js";
import { authenticateSocket } from "../middlewares/authorize.middleware.js";
import { AuthenticatedSocket } from "../types/jwt-payload.js";
import { prisma } from "../config/db.js";
export class SocketService {
  private io: SocketIOServer;
  private redisService: RedisService;

  constructor(server: SocketIOServer) {
    this.io = server;
    this.redisService = new RedisService();
    this.setupMiddleware();
    this.setupEventHandlers();

    // Test Redis connection
    this.redisService
      .ping()
      .then(() => {
        console.log("✅ Redis connected successfully");
      })
      .catch((error) => {
        console.error("❌Redis connection error:", error);
      });
  }

  private setupMiddleware() {
    this.io.use(authenticateSocket);
  }

  private setupEventHandlers() {
    this.io.on("connection", async (socket: AuthenticatedSocket) => {
      if (!socket.user) return;

      const userId = socket.user.id;

      try {
        // Add user to online list in Redis
        await this.redisService.setUserOnline(userId, socket.id);

        // Notify others about user coming online
        socket.broadcast.emit("user-online", { userId });

        socket.on("join-conversation", (conversationId) => {
          socket.join(conversationId);
        });

        // Join user to their conversation rooms
        await this.joinUserConversations(socket, userId);
        //await this.getAllConversations(socket, userId);

        socket.on("get-user-status", async (data: { userId: string }) => {
          await this.getUserStatus(socket, data);
        });

        // Message events
        socket.on("send-message", async (data) => {
          await this.handleSendMessage(socket, data);
        });

        socket.on("typing-start", async (data) => {
          await this.handleTypingStart(socket, data);
        });

        socket.on("typing-stop", async (data) => {
          await this.handleTypingStop(socket, data);
        });

        socket.on("mark-as-read", async (data) => {
          await this.handleMarkAsRead(socket, data);
        });

        socket.on("disconnect", async () => {
          await this.handleDisconnect(socket, userId);
        });

        // Send current online status to the connected user
        const onlineUsers = await this.redisService.getAllOnlineUsers();
        socket.emit("online-users", Object.keys(onlineUsers));
      } catch (error) {
        console.error("Error during socket connection:", error);
        socket.emit("connection-error", {
          error: "Failed to establish connection",
        });
      }
    });
  }

  private async joinUserConversations(
    socket: AuthenticatedSocket,
    userId: string
  ) {
    try {
      // Get conversations from database
      const conversations = await prisma.conversation.findMany({
        where: {
          participants: { some: { id: userId } }, // fetch only conversations where logged-in user is a participant
        },
        select: {
          id: true,
          hasGhotokParticipant: true,
          assignedModeratorId: true,
        },
      });

      // Store in Redis for quick access
      for (const conv of conversations) {
        await this.redisService.addUserToConversation(userId, conv.id);

        await this.redisService.setConversationMeta(conv.id, {
          hasGhotokParticipant: conv.hasGhotokParticipant,
          moderatorId: conv.assignedModeratorId || "",
        });

        socket.join(conv.id);
      }
    } catch (error) {
      console.error("Error joining conversations:", error);
    }
  }

  // private async getAllConversations(
  //   socket: AuthenticatedSocket,
  //   userId: string
  // ) {
  //   try {
  //     // Get conversations from database
  //     const conversations = await prisma.conversation.findMany({
  //       where: {
  //         participants: {
  //           some: { id: userId }, // fetch only conversations where logged-in user is a participant
  //         },
  //       },
  //       select: { id: true },
  //     });

  //     // Store in Redis for quick access
  //     for (const conv of conversations) {
  //       await this.redisService.addUserToConversation(userId, conv.id);
  //       socket.join(conv.id);
  //     }
  //   } catch (error) {
  //     console.error("Error joining conversations:", error);
  //   }
  // }

  private async getUserStatus(socket: AuthenticatedSocket, data: any) {
    try {
      const isOnline = await this.redisService.isUserOnline(data.userId);
      const lastSeen = await this.redisService.getUserLastSeen(data.userId);

      socket.emit("user-status", {
        userId: data.userId,
        isOnline,
        lastSeen: lastSeen?.toISOString() || null,
      });
    } catch (error) {
      console.error("Error getting user status:", error);
    }
  }

  private async handleSendMessage(socket: AuthenticatedSocket, data: any) {
    try {
      const { id, content, receiverId, conversationId } = data;

      if (!receiverId) {
        throw new Error("Receiver ID is required for one-to-one chat");
      }

      const now = new Date();

      // 🔐 One atomic transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1️⃣ Fetch conversation from DB (authoritative)
        const conversation = await tx.conversation.findFirst({
          where: {
            id: conversationId,
            participants: {
              some: { id: socket.user!.id },
            },
          },
          select: {
            id: true,
            participants: {
              select: {
                id: true,
                isGhotokOwned: true,
              },
            },
            assignedModeratorId: true,
          },
        });

        if (!conversation) {
          throw new Error("Conversation not found or access denied");
        }

        // 2️⃣ Decide moderation from DB
        const requiresModeration = conversation.participants.some(
          (p) => p.isGhotokOwned === true
        );

        const moderatorId = conversation.assignedModeratorId;

        // 3️⃣ Create message
        const message = await tx.message.create({
          data: {
            content,
            senderId: socket.user!.id,
            receiverId,
            conversationId,
            status: "SENT",
            moderation: requiresModeration
              ? {
                  create: {
                    ...(moderatorId && {
                      moderatorId: moderatorId,
                    }),
                    status: "PENDING",
                  },
                }
              : undefined,
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                title: true,
                lastName: true,
                gender: true,
                avatar: true,
              },
            },
            receiver: {
              select: {
                id: true,
                title: true,
                lastName: true,
                gender: true,
                avatar: true,
              },
            },
            conversation: {
              select: {
                id: true,
                convId: true,
                starConversation: true,
              },
            },
          },
        });

        // 4️⃣ Update conversation metadata
        await tx.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: now },
        });

        return { message, requiresModeration, moderatorId };
      });

      const { message, requiresModeration, moderatorId } = result;

      // Ensure sender is in the room (should already be joined)
      if (!socket.rooms.has(conversationId)) {
        console.log(`Sender ${socket.user!.id} not in room, joining now`);
        socket.join(conversationId);
      }

      const formattedMessage = {
        id: message.id,
        conversationId: message.conversation.id,
        senderId: message.sender.id,
        receiverId: message.receiver.id,
        content: message.content,
        createdAt: message.createdAt,
        status: "SENT",
        tempId: id,
      };

      if (requiresModeration) {
        this.io.to(conversationId).emit("new-message", formattedMessage);
        this.io
          .of("/teamuser")
          .to(`moderator-msg-moderation-room:${moderatorId}`)
          .emit("need-moderation-message", message);
      } else {
        // Ensure both users are in the conversation room
        const receiverSocketId =
          await this.redisService.getUserSocketId(receiverId);

        socket.join(conversationId);
        if (receiverSocketId) {
          const receiverSocket = this.io.sockets.sockets.get(receiverSocketId);
          if (receiverSocket) {
            console.log(`Receiver ${receiverId} not in room, joining now`);
            receiverSocket.join(conversationId);
          }
        }

        // Emit message to conversation room
        this.io.to(conversationId).emit("new-message", formattedMessage);
        console.log(`Message emitted to room ${conversationId}`);

        // Update message status to delivered if receiver is online
        const isReceiverOnline =
          await this.redisService.isUserOnline(receiverId);
        if (isReceiverOnline) {
          await this.updateMessageStatus(message.id, "DELIVERED", socket.id);
        }
      }
      // Store delivery status in Redis
      await this.redisService.setMessageDeliveryStatus(message.id, "SENT");
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("message-error", { error: "Failed to send message" });
    }
  }

  // private async getAllConversations(
  //   socket: AuthenticatedSocket,
  //   currentUserId: string
  // ): Promise<IConversation[]> {
  //   const conversations = await prisma.conversation.findMany({
  //     where: {
  //       participants: {
  //         some: { id: currentUserId }, // fetch only conversations where logged-in user is a participant
  //       },
  //     },
  //     select: {
  //       id: true,
  //       participants: {
  //         where: {
  //           NOT: { id: currentUserId }, // exclude the logged-in user from participants list
  //         },
  //         take: 1,
  //         select: {
  //           id: true,
  //           title: true,
  //           lastName: true,
  //           avatar: true,
  //         },
  //       },
  //       messages: {
  //         orderBy: { createdAt: "desc" },
  //         take: 1,
  //         select: {
  //           id: true,
  //           senderId: true,
  //           content: true,
  //           createdAt: true,
  //           status: true,
  //         },
  //       },
  //       _count: {
  //         select: {
  //           messages: {
  //             where: {
  //               status: { not: "READ" }, // ✅ unread messages count
  //               senderId: { not: currentUserId },
  //             },
  //           },
  //         },
  //       },
  //     },
  //     orderBy: {
  //       updatedAt: "desc",
  //     },
  //   });

  //   // Get all user IDs for online status lookup
  //   const allUserIds = conversations.flatMap((conv) =>
  //     conv.participants.map((p) => p.id)
  //   );
  //   const uniqueUserIds = [...new Set(allUserIds)];

  //   // Get online statuses from Redis
  //   const onlineStatuses =
  //     await this.redisService.getOnlineStatuses(uniqueUserIds);

  //   // Format response with online status from Redis
  //   const formattedConversations = conversations.map((conv) => {
  //     const otherParticipant = conv.participants[0];
  //     const lastMessage = conv.messages[0];

  //     // Get online status from Redis instead of database
  //     const userStatus = onlineStatuses[otherParticipant?.id || ""];

  //     return {
  //       id: conv.id,
  //       participant: {
  //         id: otherParticipant?.id || "",
  //         title: otherParticipant?.title || "",
  //         lastName: otherParticipant?.lastName || "",
  //         avatar: otherParticipant?.avatar || null,
  //         isOnline: userStatus?.isOnline || false,
  //         lastSeen: userStatus?.lastSeen || null,
  //       },
  //       lastMessage: {
  //         id: lastMessage?.id,
  //         content: lastMessage?.content,
  //         senderId: lastMessage?.senderId ?? "",
  //         status: lastMessage?.status,
  //         createdAt: lastMessage?.createdAt,
  //       },
  //       unreadCount: conv._count.messages,
  //       //updatedAt: conv.updatedAt
  //     };
  //   });

  //   return formattedConversations;
  // }

  private async handleTypingStart(socket: AuthenticatedSocket, data: any) {
    const { receiverId, conversationId } = data;

    if (!receiverId) return;

    try {
      await this.redisService.setTypingStatus(
        socket.user!.id,
        conversationId,
        true
      );

      // Notify the receiver
      const receiverSocketId =
        await this.redisService.getUserSocketId(receiverId);
      if (receiverSocketId) {
        this.io.to(receiverSocketId).emit("user-typing-start", {
          userId: socket.user!.id,
          conversationId,
        });
      }
    } catch (error) {
      console.error("Error handling typing start:", error);
    }
  }

  private async handleTypingStop(socket: AuthenticatedSocket, data: any) {
    const { receiverId, conversationId } = data;

    if (!receiverId) return;

    try {
      await this.redisService.setTypingStatus(
        socket.user!.id,
        conversationId,
        false
      );

      // Notify the receiver
      const receiverSocketId =
        await this.redisService.getUserSocketId(receiverId);
      if (receiverSocketId) {
        this.io.to(receiverSocketId).emit("user-typing-stop", {
          userId: socket.user!.id,
          conversationId,
        });
      }
    } catch (error) {
      console.error("Error handling typing stop:", error);
    }
  }

  private async handleMarkAsRead(socket: AuthenticatedSocket, data: any) {
    const { messageIds, receiverId, conversationId } = data;

    if (!receiverId || !messageIds || messageIds.length === 0) return;

    try {
      await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
          conversationId,
          status: { not: "READ" },
        },
        data: {
          status: "READ",
          //readAt: new Date()
        },
      });

      // Notify the receiver
      const senderSocketId =
        await this.redisService.getUserSocketId(receiverId);

      // Update Redis status
      for (const messageId of messageIds) {
        await this.redisService.setMessageDeliveryStatus(messageId, "READ");
        this.io.to(senderSocketId!).emit("message-status-update", {
          messageId,
          status: "READ",
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }

  private async updateMessageStatus(
    messageId: string,
    status: "DELIVERED" | "READ",
    senderSocketId: string
  ) {
    try {
      await prisma.message.update({
        where: { id: messageId },
        data: {
          status: status,
        },
      });

      // Update Redis
      await this.redisService.setMessageDeliveryStatus(messageId, status);

      this.io.to(senderSocketId).emit("message-status-update", {
        messageId,
        status,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  }

  private async handleDisconnect(socket: AuthenticatedSocket, userId: string) {
    try {
      await this.redisService.cleanupUserData(userId);

      // Notify others about user going offline
      socket.broadcast.emit("user-offline", { userId });
    } catch (error) {
      console.error("Error during disconnect:", error);
    }
  }

  public getIO() {
    return this.io;
  }

  public getRedisService() {
    return this.redisService;
  }
}
