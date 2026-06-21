// src/services/team-socket.service.js
import { Server as SocketIOServer } from "socket.io";
import { RedisService } from "./RedisService.js";
import { AuthenticatedTeamUserSocket } from "../types/jwt-payload.js";
import { prisma } from "../config/db.js";
import { Role } from "../types/roles.js";
import { UserType } from "../types/user-type.js";

export class TeamUserNotificationHelper {
  private teamUserChatRoom: string = "team-user-chat-room";
  private teamUserNotificationRoom: string = "team-user-notification-room";

  public joinTeamUserChatRoom(
    socket: AuthenticatedTeamUserSocket,
    conversationId: string
  ) {
    socket.join(`${this.teamUserChatRoom}:${conversationId}`);
  }

  public joinTeamUserNotificationRoom(
    socket: AuthenticatedTeamUserSocket,
    userId: string
  ) {
    socket.join(`${this.teamUserNotificationRoom}:${userId}`);
  }

  public getTeamUserChatRoom(conversationId: string) {
    return `${this.teamUserChatRoom}:${conversationId}`;
  }

  public getTeamUserNotificationRoom(receiverId: string) {
    return `${this.teamUserNotificationRoom}:${receiverId}`;
  }
}

export class TeamUserSocketService {
  private io: SocketIOServer;
  private redisService: RedisService;
  private teamUsernotifyHelper: TeamUserNotificationHelper;
  private namespace: any;

  constructor(server: SocketIOServer) {
    this.io = server;
    // Create separate namespace for team conversations
    this.namespace = this.io.of("/teamuser");

    this.redisService = new RedisService();
    this.teamUsernotifyHelper = new TeamUserNotificationHelper();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.namespace.use(this.authenticateSocket.bind(this));
  }

  private async authenticateSocket(
    socket: AuthenticatedTeamUserSocket,
    next: any
  ) {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error("Missing token");

      const tokenType = token.split("_")[0];
      const realToken = token.split("_")[1];

      if (
        tokenType === "USER" &&
        realToken !== "" &&
        realToken !== null &&
        realToken !== "undefined"
      ) {
        // 1️⃣ Check USER session first
        const userSession = await prisma.userSession.findUnique({
          where: { token: realToken },
          include: { user: true },
        });

        if (userSession) {
          if (userSession.expiresAt < new Date()) {
            return next(new Error("User session expired"));
          }

          socket.user = {
            id: userSession.userId,
            gender: userSession.user.gender,
            type: userSession.user.type as UserType,
            planExpiryDate: userSession.user?.planExpiryDate,
            tokenType: "USER",
          };

          return next();
        }
      }

      if (
        tokenType === "TEAM" &&
        realToken !== "" &&
        realToken !== null &&
        realToken !== "undefined"
      ) {
        // 2️⃣ Check TEAM session
        const teamSession = await prisma.teamSession.findUnique({
          where: { token: realToken },
          include: { team: true },
        });

        if (teamSession) {
          if (teamSession.expiresAt < new Date()) {
            return next(new Error("Team session expired"));
          }

          socket.user = {
            id: teamSession.userId,
            role: teamSession.team.role as Role,
            isProfileComplete: teamSession.team.isProfileComplete,
            tokenType: "TEAM",
          };

          return next();
        }
      }

      // 3️⃣ Token not found anywhere
      return next(new Error("Invalid session token"));
    } catch (error) {
      next(new Error("Team socket authentication error"));
    }
  }

  private setupEventHandlers() {
    this.namespace.on(
      "connection",
      async (socket: AuthenticatedTeamUserSocket) => {
        //console.log("🏢 Team & User socket connected:", socket.id);

        if (!socket.user) return;

        try {
          if (
            socket.user.tokenType === "TEAM" ||
            socket.user.tokenType === "USER"
          ) {
            socket.join(`ghotok-and-user-room:${socket.user.id}`);
            socket.join(`moderator-msg-moderation-room:${socket.user.id}`);

            //For Chat [ ADMIN & GROOM ] | [MODERATOR & BRIDE]
            //socket.join(`team-and-user-chat-room:${socket.user.id}`);
            this.teamUsernotifyHelper.joinTeamUserNotificationRoom(
              socket,
              socket.user.id
            );
          }

          // Join team conversation rooms
          //await this.joinTeamConversations(socket);
          // Auto-join user's active conversations
          // socket.on(
          //   "join-team-user-active-conversations",
          //   async (data: { conversationId: string }) => {
          //     await this.joinUserActiveConversations(
          //       socket,
          //       data.conversationId
          //     );
          //   }
          // );

          // Auto-join moderator's to active conversations for moderation
          // because moderator can be on multiple conversations
          // if (socket.user.tokenType === "TEAM") {
          //   await this.joinModerationConversations(socket);
          // }

          // Join team conversation rooms
          socket.on(
            "join-team-user-conversations",
            async (data: { conversationId: string }) => {
              this.teamUsernotifyHelper.joinTeamUserChatRoom(
                socket,
                data.conversationId
              );
            }
          );

          // Join ghotok & user to conversation rooms
          socket.on(
            "join-ghotok-user-active-conversations",
            async (data: { conversationId: string }) => {
              this.joinGhotokUserConversations(socket, data.conversationId);
            }
          );

          // socket.on("join-user-to-all-team", async () => {
          //   await this.joinUserToTeamConversations(socket);
          // });

          // Team-specific message events
          socket.on("send-team-user-message", async (data: any) => {
            await this.handleSendTeamUserMessage(socket, data);
          });

          socket.on(
            "team-user-message:payment-reject",
            async (data: { messageId: string; conversationId: string }) => {
              await this.handlePaymentReject(socket, data);
            }
          );

          // Team-specific message events
          socket.on("send-ghotok-user-message", async (data: any) => {
            await this.handleSendGhotokUserMessage(socket, data);
          });

          socket.on(
            "modaration-message-update",
            async (data: {
              messageId: string;
              moderateStatus: "APPROVED" | "REJECTED";
              reason: string;
            }) => {
              await this.handleUpdateModerationMessage(
                socket,
                data.messageId,
                data.moderateStatus,
                data.reason
              );
            }
          );

          socket.on(
            "ghotok-user-mark-as-read",
            async (data: { messageIds: string[]; conversationId: string }) => {
              await this.handleGhotokUserMessageMarkRead(
                socket,
                data.messageIds,
                data.conversationId
              );
            }
          );

          socket.on("disconnect", async () => {
            await this.handleTeamDisconnect(socket);
          });
        } catch (error) {
          console.error("Error during team socket connection:", error);
          socket.emit("team-connection-error", {
            error: "Failed to establish team connection",
          });
        }
      }
    );
  }

  private async notifyToTeamUser(
    conversationId: string,
    receiverId: string,
    payload: any
  ) {
    const chatRoomName =
      this.teamUsernotifyHelper.getTeamUserChatRoom(conversationId);
    const notificationRoomName =
      this.teamUsernotifyHelper.getTeamUserNotificationRoom(receiverId);
    this.namespace.to(chatRoomName).emit("new-team-user-message", payload);
    this.namespace
      .to(notificationRoomName)
      .emit("team-user-message:notify", payload);
  }

  private async handlePaymentReject(
    socket: AuthenticatedTeamUserSocket,
    data: { messageId: string; conversationId: string }
  ) {
    const { messageId, conversationId } = data;

    const message = await prisma.teamUserMessage.update({
      where: { id: messageId },
      data: {
        paymentPhase: "DECLINED",
      },
      select: {
        senderTeamId: true,
        status: true,
        paymentPhase: true,
      },
    });

    const payload = {
      messageId: messageId,
      status: message.status,
      paymentPhase: message.paymentPhase,
    };

    const chatRoomName =
      this.teamUsernotifyHelper.getTeamUserChatRoom(conversationId);

    // Emit to all participants in the team conversation
    this.namespace.to(chatRoomName).emit("team-user-message:update", payload);
    // if (socket.user?.tokenType === "USER") {
    //   this.namespace
    //     .to(`team-and-user-chat-room:${message.senderTeamId}`)
    //     .emit("team-and-user-message:update", payload);
    // }
  }

  private async handleGhotokUserMessageMarkRead(
    socket: AuthenticatedTeamUserSocket,
    messageIds: string[],
    conversationId: string
  ) {
    try {
      if (!messageIds?.length || !conversationId) return;

      // 🔍 Fetch one message to determine sender/receiver type
      const message = await prisma.message.findFirst({
        where: {
          id: { in: messageIds },
          conversationId,
        },
        select: {
          sender: {
            select: {
              ghotokId: true,
            },
          },
          receiver: {
            select: {
              isGhotokOwned: true,
              ghotokId: true,
            },
          },
        },
      });

      if (!message) return;

      // 🔑 Determine sender type from DB
      const isReceiverGhotokUser =
        Boolean(message.receiver?.ghotokId) ||
        message.receiver?.isGhotokOwned === true;
      const senderGhotokId = message.sender?.ghotokId;

      // ✅ Update DB
      await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
          conversationId,
          status: { not: "READ" },
        },
        data: {
          status: "READ",
          // readAt: new Date(),
        },
      });

      const userNamespace = this.io.of("/");
      const teamNamespace = this.io.of("/teamuser");

      // 🔁 Update Redis + emit
      for (const messageId of messageIds) {
        await this.redisService.setMessageDeliveryStatus(messageId, "READ");

        const payload = {
          messageId,
          status: "READ",
          timestamp: new Date(),
        };

        if (isReceiverGhotokUser) {
          // 🧑‍💼 Ghotok sent → notify User
          userNamespace.to(conversationId).emit("message-mark-read", payload);
        } else {
          // 👤 User sent → notify Ghotok
          teamNamespace
            .to(`ghotok-and-user-room:${senderGhotokId}`)
            .emit("message-mark-read", payload);
        }
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }

  private async handleUpdateModerationMessage(
    socket: AuthenticatedTeamUserSocket,
    messageId: string,
    moderateStatus: "APPROVED" | "REJECTED",
    reason?: string
  ) {
    if (!messageId) {
      socket.emit("message-error", {
        error: "Moderation : Missing messageId",
      });
      return;
    }

    //console.log("handleUpdateModerationMessage", messageId, moderateStatus);

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        conversationId: true,
        receiver: {
          select: {
            ghotokId: true,
          },
        },
        sender: {
          select: {
            ghotokId: true,
            isGhotokOwned: true,
          },
        },
      },
    });

    if (!message) {
      socket.emit("message-error", {
        error: "Moderation : Message not found",
      });
      return;
    }

    // Verify user is in the conversation room
    // if (!socket.rooms.has(`moderation-conv-room:${message.conversationId}`)) {
    //   socket.emit("message-error", { error: "Not in conversation room" });
    //   return;
    // }

    // 🔑 Determine sender type from DB (no client input)
    const isSenderGhotokUser =
      Boolean(message.sender?.ghotokId) ||
      message.sender?.isGhotokOwned === true;
    const receiverGhotokId = message.receiver?.ghotokId;

    const updateMessage = await prisma.message.update({
      where: { id: message.id },
      data: {
        moderation: {
          update: {
            status: moderateStatus,
            reason,
          },
        },
        status: moderateStatus === "APPROVED" ? "DELIVERED" : "SENT",
      },
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        receiverId: true,
        content: true,
        status: true,
        createdAt: true,
        moderation: {
          select: {
            status: true,
            reason: true,
          },
        },
        receiver: {
          select: {
            gender: true,
          },
        },
      },
    });

    const payload = {
      id: updateMessage.id,
      conversationId: updateMessage.conversationId,
      senderId: updateMessage.senderId,
      receiverId: updateMessage.receiverId,
      content: updateMessage.content,
      status: updateMessage.status,
      createdAt: updateMessage.createdAt,
      receiverGender: updateMessage.receiver.gender,
      moderation: updateMessage.moderation,
    };

    const teamNamespace = this.io.of("/teamuser");
    const userNamespace = this.io.of("/");
    // 1️⃣ Always update ghotok moderation UI
    teamNamespace
      .to(`moderator-msg-moderation-room:${socket.user?.id}`)
      .emit("moderation-message-updated", payload);

    if (moderateStatus === "APPROVED") {
      // 2️⃣ Notify based on sender type
      if (isSenderGhotokUser) {
        // Ghotok → User
        userNamespace
          .to(`${message.conversationId}`)
          .emit("ghotok-user-new-message", payload);
      } else {
        // User → Ghotok
        teamNamespace
          .to(`ghotok-and-user-room:${receiverGhotokId}`)
          .emit("ghotok-user-new-message", payload);
      }

      /* 3️⃣ 🔑 Notify sender that message is DELIVERED */
      if (isSenderGhotokUser) {
        teamNamespace
          .to(`moderation-conv-room:${message.conversationId}`) // sender socket joined by userId
          .emit("message-delivery-status", payload);
      } else {
        userNamespace
          .to(message.conversationId)
          .emit("message-delivery-status", payload);
      }
    } else {
      if (isSenderGhotokUser) {
        teamNamespace
          .to(`moderation-conv-room:${message.conversationId}`) // sender socket joined by userId
          .emit("message-delivery-status", payload);
      } else {
        userNamespace
          .to(message.conversationId)
          .emit("message-delivery-status", payload);
      }
    }

    // this.namespace
    //   .to(`moderation-conv-room:${message.conversationId}`)
    //   .emit("moderation-message-updated", updateMessage);

    // if (moderateStatus === "APPROVED") {
    //   this.io
    //     .of("/") // 🔥 ROOT NAMESPACE
    //     .to(`${message.conversationId}`)
    //     .emit("moderation-message-updated", updateMessage);
    // }
  }

  private async joinGhotokUserConversations(
    socket: AuthenticatedTeamUserSocket,
    conversationId: string
  ) {
    try {
      // join each assigned conversation room

      const roomName = `moderation-conv-room:${conversationId}`;
      socket.join(roomName);
      socket.join(conversationId);
    } catch (error) {
      console.error("Error joining active conversations:", error);
    }
  }

  // private async joinModerationConversations(
  //   socket: AuthenticatedTeamUserSocket
  // ) {
  //   try {
  //     const conversations = await prisma.conversation.findMany({
  //       where: {
  //         assignedModeratorId: socket.user!.id,
  //       },
  //       select: {
  //         id: true,
  //       },
  //     });

  //     if (!conversations.length) return;

  //     // join each assigned conversation room
  //     for (const conv of conversations) {
  //       const roomName = `moderation-conv-room:${conv.id}`;
  //       socket.join(roomName);
  //     }

  //     // emit confirmation to client
  //     socket.emit("moderation-conversations-joined", {
  //       conversations: conversations.map((c) => c.id),
  //     });
  //   } catch (error) {
  //     console.error("Error joining active conversations:", error);
  //   }
  // }

  // private async joinUserActiveConversations(
  //   socket: AuthenticatedTeamUserSocket,
  //   conversationId: string
  // ) {
  //   try {
  //     const userType = socket.user?.tokenType;

  //     if (!userType) return;

  //     const conversation = await prisma.teamUserConversation.findFirst({
  //       where: {
  //         id: conversationId,
  //       },
  //       include: {
  //         team: true,
  //         user: true,
  //       },
  //     });

  //     if (userType === "TEAM" && conversation?.team) {
  //       const validation = this.chatValidation.canTeamMemberChat(
  //         socket.user!.role as Role,
  //         conversation.user.gender as Gender
  //       );

  //       if (validation.allowed) {
  //         const roomName = `team-user-conv:${conversation.id}`;
  //         socket.join(roomName);

  //         socket.emit("conversations-joined", {
  //           conversations: conversationId,
  //         });
  //       } else {
  //         console.warn(
  //           `Conversation ${conversation.id} blocked: ${validation.reason}`
  //         );
  //       }
  //     }

  //     if (userType === "USER" && conversation?.user) {
  //       const validation = this.chatValidation.canTeamMemberChat(
  //         conversation.team.role as Role,
  //         socket.user!.gender as Gender
  //       );

  //       //console.log("validation", validation.allowed, validation.reason);

  //       if (validation.allowed) {
  //         this.joinConversationRoom(socket, conversation.id);

  //         socket.emit("conversations-joined", {
  //           conversations: conversationId,
  //         });
  //       } else {
  //         console.warn(
  //           `Conversation ${conversation.id} blocked: ${validation.reason}`
  //         );
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error joining active conversations:", error);
  //   }
  // }

  // private async joinUserToTeamConversations(
  //   socket: AuthenticatedTeamUserSocket
  // ) {
  //   try {
  //     const conversations = await prisma.teamUserConversation.findMany({
  //       where: {
  //         userId: socket.user!.id,
  //       },
  //       include: {
  //         team: true,
  //         user: true,
  //       },
  //     });

  //     for (const conversation of conversations) {
  //       this.joinConversationRoom(socket, conversation.id);
  //     }

  //     socket.emit("conversations-joined", {
  //       conversations: conversations.map((c) => c.id),
  //     });
  //   } catch (error) {
  //     console.error("Error joining team conversations:", error);
  //   }
  // }

  // private joinConversationRoom(
  //   socket: AuthenticatedTeamUserSocket,
  //   conversationId: string
  // ) {
  //   const roomName = `team-user-conv:${conversationId}`;
  //   socket.join(roomName);
  // }

  // private async joinUserActiveConversations(
  //   socket: AuthenticatedTeamUserSocket
  // ) {
  //   try {
  //     const userType = socket.user?.tokenType;

  //     if (!userType) return;

  //     const activeConversations = await this.getUserActiveConversations(
  //       socket.user!.id,
  //       userType
  //     );

  //     for (const conversation of activeConversations) {
  //       // Only apply restriction check if it's a TEAM member
  //       if (userType === "TEAM" && conversation.team) {
  //         const validation = this.chatValidation.canTeamMemberChat(
  //           socket.user!.role as Role,
  //           conversation.user.gender as Gender
  //         );

  //         console.log("validation", validation.allowed, validation.reason);

  //         if (!validation.allowed) {
  //           console.warn(
  //             `Conversation ${conversation.id} blocked: ${validation.reason}`
  //           );
  //           continue; // Skip joining this room
  //         }
  //       }

  //       const roomName = `team-user-conv:${conversation.id}`;
  //       socket.join(roomName);
  //     }

  //     socket.emit("conversations-joined", {
  //       conversations: activeConversations.map((c) => c.id),
  //     });
  //   } catch (error) {
  //     console.error("Error joining active conversations:", error);
  //   }
  // }

  // private async getUserActiveConversations(userId: string, userType: string) {
  //   return await prisma.teamUserConversation.findMany({
  //     where: {
  //       ...(userType === "TEAM"
  //         ? { senderTeamId: userId }
  //         : { senderUserId: userId }),
  //       updatedAt: {
  //         gte: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // last 15 days
  //       },
  //     },
  //     select: {
  //       id: true,
  //       team: {
  //         select: { id: true, role: true },
  //       },
  //       user: {
  //         select: { id: true, gender: true },
  //       },
  //     },
  //     take: 20,
  //     orderBy: { updatedAt: "desc" },
  //   });
  // }

  //For Team & User Message

  private async handleSendTeamUserMessage(
    socket: AuthenticatedTeamUserSocket,
    data: any
  ) {
    try {
      const {
        conversationId,
        content,
        senderTeamId,
        senderUserId,
        type = "TEXT",
        planId,
        paymentPhase,
      } = data;

      if (!conversationId) {
        socket.emit("message-error", {
          error: "Missing conversationId",
        });
        return;
      }

      if (!content?.trim()) {
        socket.emit("message-error", { error: "Missing message content" });
        return;
      }

      if (socket.user?.tokenType === "TEAM") {
        if (!senderTeamId) {
          socket.emit("message-error", { error: "Missing senderTeamId" });
          return;
        }
      } else {
        if (!senderUserId) {
          socket.emit("message-error", { error: "Missing senderUserId" });
          return;
        }
      }

      // Verify user is in the conversation room
      // if (!socket.rooms.has(`team-user-conv:${conversationId}`)) {
      //   socket.emit("message-error", { error: "Not in conversation room" });
      //   return;
      // }

      const [saveMessage] = await prisma.$transaction([
        prisma.teamUserMessage.create({
          data: {
            content,
            conversationId,
            ...(socket.user?.tokenType === "TEAM" ? { senderTeamId } : {}),
            ...(socket.user?.tokenType === "USER" ? { senderUserId } : {}),
            type,
            planId,
            paymentPhase,
          },
          select: {
            id: true,
            conversationId: true,
            senderTeamId: true,
            senderUserId: true,
            content: true,
            type: true,
            plan: {
              select: {
                id: true,
                title: true,
                price: true,
                duration: true,
              },
            },
            paymentPhase: true,
            status: true,
            createdAt: true,
            senderUser: {
              select: {
                gender: true,
              },
            },
            conversation: {
              select: {
                teamId: true,
                userId: true,
              },
            },
            senderTeam: {
              select: {
                internalId: true,
                role: true,
              },
            },
          },
        }),

        prisma.teamUserConversation.update({
          where: { id: conversationId },
          data: {
            lastMessageAt: new Date(),
          },
        }),
      ]);

      const payload = {
        id: saveMessage.id,
        conversationId: saveMessage.conversationId,
        senderTeamId: saveMessage.senderTeamId,
        senderUserId: saveMessage.senderUserId,
        content: saveMessage.content,
        type: saveMessage.type,
        planId: saveMessage.plan?.id,
        planTitle: saveMessage.plan?.title,
        planPrice: saveMessage.plan?.price,
        planDuration: saveMessage.plan?.duration,
        paymentPhase: saveMessage.paymentPhase,
        status: saveMessage.status,
        createdAt: saveMessage.createdAt,
        receiverGender: saveMessage.senderUser?.gender,
        senderTeam: saveMessage.senderTeam,
      };

      const receiverId =
        socket.user?.tokenType === "TEAM"
          ? saveMessage.conversation.userId
          : saveMessage.conversation.teamId;

      //const roomName = `team-user-conv:${conversationId}`;

      // Emit to all participants in the team conversation
      //this.namespace.to(roomName).emit("new-team-user-message", payload);
      // this.namespace
      //   .to(`team-and-user-chat-room:${receiverId}`)
      //   .emit("team-and-user-message:notify", payload);
      this.notifyToTeamUser(saveMessage.conversationId, receiverId, payload);
      //console.log(`Team message sent to room: ${roomName} : ${saveMessage}`);

      // Update message status to delivered for online users
      //   const onlineUsers =
      //     await this.redisService.getOnlineUsersInTeamConversation(
      //       conversationId
      //     );
      //   if (onlineUsers.length > 0) {
      //     await messageService.updateMessageStatus(message.id, "DELIVERED");
      //   }
    } catch (error) {
      console.error("Error sending team message:", error);
      socket.emit("team-message-error", {
        error: "Failed to send team message",
      });
    }
  }

  private async handleSendGhotokUserMessage(
    socket: AuthenticatedTeamUserSocket,
    data: any
  ) {
    try {
      const { id, conversationId, content, senderId, receiverId } = data;

      if (!conversationId) {
        socket.emit("message-error", {
          error: "Missing conversationId",
        });
        return;
      }

      if (!senderId) {
        socket.emit("message-error", { error: "Missing senderId" });
        return;
      }

      if (!receiverId) {
        socket.emit("message-error", { error: "Missing receiverId" });
        return;
      }

      if (!content?.trim()) {
        socket.emit("message-error", { error: "Missing message content" });
        return;
      }

      // Verify user is in the conversation room
      // if (!socket.rooms.has(`moderation-conv-room:${conversationId}`)) {
      //   socket.emit("message-error", { error: "Not in conversation room" });
      //   return;
      // }

      const now = new Date();

      // 🔐 One atomic transaction
      const message = await prisma.$transaction(async (tx) => {
        // 1️⃣ Create message
        const moderatorId = await tx.conversation.findUnique({
          where: { id: conversationId },
          select: {
            assignedModeratorId: true,
          },
        });
        const message = await tx.message.create({
          data: {
            content,
            senderId,
            receiverId,
            conversationId,
            status: "SENT",
            moderation: {
              create: {
                ...(moderatorId?.assignedModeratorId && {
                  moderatorId: moderatorId.assignedModeratorId,
                }),
                status: "PENDING",
              },
            },
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
                assignedModeratorId: true,
              },
            },
          },
        });

        // 2️⃣ Update conversation metadata
        await tx.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: now },
        });

        return message;
      });

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

      //TODO adasdasd
      // this.io
      //   .of("/teamuser")
      //   .to(`moderation-conv-room:${conversationId}`)
      //   .emit("need-moderation-message", message);
      this.namespace
        .to(
          `moderator-msg-moderation-room:${message.conversation?.assignedModeratorId}`
        )
        .emit("need-moderation-message", message);
      // this.io
      //   .of("/teamuser")
      //   .to(`moderation-conv-room:${conversationId}`)
      //   .emit("ghotok-send-message", formattedMessage);
      this.namespace
        .to(`ghotok-and-user-room:${socket.user?.id}`)
        .emit("ghotok-send-message", formattedMessage);
      //console.log(`Team message sent to room: ${roomName} : ${saveMessage}`);

      // Update message status to delivered for online users
      //   const onlineUsers =
      //     await this.redisService.getOnlineUsersInTeamConversation(
      //       conversationId
      //     );
      //   if (onlineUsers.length > 0) {
      //     await messageService.updateMessageStatus(message.id, "DELIVERED");
      //   }
    } catch (error) {
      console.error("Error sending team message:", error);
      socket.emit("team-message-error", {
        error: "Failed to send team message",
      });
    }
  }

  //   private async handleTeamTypingStart(
  //     socket: AuthenticatedSocket,
  //     data: TypingPayload
  //   ) {
  //     const { conversationId } = data;

  //     try {
  //       await this.redisService.setTeamTypingStatus(
  //         socket.user!.id,
  //         conversationId,
  //         true
  //       );

  //       const roomName = `team-conversation:${conversationId}`;

  //       // Notify other participants
  //       socket.to(roomName).emit("team-user-typing-start", {
  //         userId: socket.user!.id,
  //         conversationId,
  //       });
  //     } catch (error) {
  //       console.error("Error handling team typing start:", error);
  //     }
  //   }

  //   private async handleTeamTypingStop(
  //     socket: AuthenticatedSocket,
  //     data: TypingPayload
  //   ) {
  //     const { conversationId } = data;

  //     try {
  //       await this.redisService.setTeamTypingStatus(
  //         socket.user!.id,
  //         conversationId,
  //         false
  //       );

  //       const roomName = `team-conversation:${conversationId}`;

  //       // Notify other participants
  //       socket.to(roomName).emit("team-user-typing-stop", {
  //         userId: socket.user!.id,
  //         conversationId,
  //       });
  //     } catch (error) {
  //       console.error("Error handling team typing stop:", error);
  //     }
  //   }

  //   private async handleTeamMarkAsRead(
  //     socket: AuthenticatedSocket,
  //     data: { messageIds: string[]; conversationId: string }
  //   ) {
  //     try {
  //       const { messageIds, conversationId } = data;

  //       const messageService = new (
  //         await import("./message.service")
  //       ).MessageService();

  //       for (const messageId of messageIds) {
  //         await messageService.updateMessageStatus(messageId, "READ");
  //       }

  //       const roomName = `team-conversation:${conversationId}`;

  //       // Notify other participants
  //       socket.to(roomName).emit("team-messages-read", {
  //         messageIds,
  //         conversationId,
  //         readBy: socket.user!.id,
  //       });
  //     } catch (error) {
  //       console.error("Error marking team messages as read:", error);
  //     }
  //   }

  private async handleTeamDisconnect(socket: AuthenticatedTeamUserSocket) {
    try {
      await this.redisService.cleanupTeamUserData(socket.user!.id);
      //console.log("🏢 Team socket disconnected:", socket.id);
    } catch (error) {
      console.error("Error during team disconnect:", error);
    }
  }

  //   private async verifyTeamAccess(
  //     userId: string,
  //     conversationId: string
  //   ): Promise<boolean> {
  //     try {
  //       const conversation = await prisma.teamConversation.findFirst({
  //         where: {
  //           id: conversationId,
  //           participants: {
  //             some: {
  //               team: {
  //                 members: {
  //                   some: {
  //                     userId: userId,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       });

  //       return !!conversation;
  //     } catch (error) {
  //       console.error("Error verifying team access:", error);
  //       return false;
  //     }
  //   }

  public getIO() {
    return this.io;
  }

  public getNamespace() {
    return this.namespace;
  }
}
