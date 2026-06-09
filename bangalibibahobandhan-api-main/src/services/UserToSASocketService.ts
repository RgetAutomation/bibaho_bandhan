// src/services/team-socket.service.js
import { Server as SocketIOServer } from "socket.io";
import { RedisService } from "./RedisService.js";
import { AuthenticatedTeamUserSocket } from "../types/jwt-payload.js";
import { prisma } from "../config/db.js";
import { Role } from "../types/roles.js";
import { UserType } from "../types/user-type.js";
import { Prisma } from "@prisma/client";

export class UserToSASocketService {
  private io: SocketIOServer;
  private redisService: RedisService;
  private namespace: any;

  constructor(server: SocketIOServer) {
    this.io = server;
    // Create separate namespace for team conversations
    this.namespace = this.io.of("/sauser");

    this.redisService = new RedisService();
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
            tokenType:
              teamSession.team.role === "SUPERADMIN" ? "SUPERADMIN" : "TEAM",
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
        //console.log("🏢 User to SA socket connected:", socket.id);

        if (!socket.user) return;

        try {
          // Join team conversation rooms
          //await this.joinTeamConversations(socket);
          // Auto-join user's active conversations
          //await this.joinUserActiveConversations(socket);

          const userId = socket.user.id;
          const userType = socket.user.tokenType;

          if (userType === "USER") {
            socket.join(`user-notification-${userId}`);
          }

          if (userType === "TEAM") {
            socket.join(`team-notification-${userId}`);
          }

          if (userType === "SUPERADMIN") {
            socket.join("superadmin-notification");
          }

          socket.on(
            "user-superadmin-chat:join",
            async (data: { conversationId: string }) => {
              socket.join(`user-superadmin-${data.conversationId}`);
            }
          );

          // Team-specific message events
          socket.on("user-superadmin-chat:send", async (data: any) => {
            await this.handleSendTeamMessage(socket, data);
          });

          socket.on("user-superadmin-chat:read", async (data: any) => {
            await this.handleMarkAsRead(socket, data);
          });

          socket.on(
            "user-superadmin-chat:payment-reject",
            async (data: { messageId: string; conversationId: string }) => {
              await this.handlePaymentReject(socket, data);
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

  private async handlePaymentReject(
    socket: AuthenticatedTeamUserSocket,
    data: { messageId: string; conversationId: string }
  ) {
    const { messageId, conversationId } = data;

    const message = await prisma.superAdminUserMessage.update({
      where: { id: messageId },
      data: {
        paymentPhase: "DECLINED",
      },
    });

    const payload = {
      messageId: messageId,
      status: message.status,
      paymentPhase: message.paymentPhase,
    };

    socket
      .to(`user-superadmin-${conversationId}`)
      .emit("user-superadmin-chat:message-status-update", payload);
    socket.emit("user-superadmin-chat:message-status-update", payload);
  }

  private async handleMarkAsRead(
    socket: AuthenticatedTeamUserSocket,
    data: any
  ) {
    const { messageIds, userId, conversationId } = data;

    if (!userId || !messageIds || messageIds.length === 0) return;

    try {
      await prisma.superAdminUserMessage.updateMany({
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

      //Update Redis status
      for (const messageId of messageIds) {
        //await this.redisService.setMessageDeliveryStatus(messageId, "READ");

        socket
          .to(`user-superadmin-${conversationId}`)
          .emit("user-superadmin-chat:message-status-update", {
            messageId,
            status: "READ",
            timestamp: new Date(),
          });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }

  private async handleSendTeamMessage(
    socket: AuthenticatedTeamUserSocket,
    data: any
  ) {
    try {
      const {
        conversationId,
        userId,
        content,
        type = "TEXT",
        price,
        paymentPhase,
        reportId,
        id,
      } = data;

      if (!socket.user) return;

      const sender = socket.user;
      const senderId = sender.id;

      if (!conversationId || !content) {
        socket.emit("message-error", {
          error: "Missing conversationId or content",
        });
        return;
      }

      // Verify user is in the conversation room
      // if (!socket.rooms.has(`user-superadmin-${userId}`)) {
      //   socket.emit("message-error", { error: "Not in conversation room" });
      //   return;
      // }

      const { conversation, message } = await prisma.$transaction(
        async (tx) => {
          const conversation = await tx.superAdminUserConversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
            select: {
              user: {
                select: {
                  ghotokId: true,
                  isGhotokOwned: true,
                },
              },
            },
          });

          const message = await tx.superAdminUserMessage.create({
            data: {
              conversation: {
                connect: { id: conversationId },
              },
              senderId,
              content,
              type,
              reportId,
              price,
              paymentPhase,
            },
            select: {
              id: true,
              conversationId: true,
              content: true,
              senderId: true,
              type: true,
              price: true,
              paymentPhase: true,
              createdAt: true,
              status: true,
              matchingPaymentId: true,
            },
          });

          return { conversation, message };
        }
      );

      const payload = {
        id: message.id,
        senderId,
        conversationId: message.conversationId,
        content: message.content,
        type: message.type,
        price: message.price,
        paymentPhase: message.paymentPhase,
        createdAt: message.createdAt,
        status: message.status,
        matchingPaymentId: message.matchingPaymentId,
        tempId: id, // 👈 map optimistic message
      };

      //console.log("payload", payload);

      // this.namespace
      //   .of("/sauser")

      socket
        .to(`user-superadmin-${conversationId}`)
        .emit("user-superadmin-chat:new-message", payload);
      socket.emit("user-superadmin-chat:new-message", payload);

      //console.log("tokenType", sender.tokenType);

      if (
        socket.user.tokenType === "USER" ||
        socket.user.tokenType === "TEAM"
      ) {
        socket
          .to("superadmin-notification")
          .emit("user-superadmin-chat:notification", payload.conversationId);
      }

      if (socket.user.tokenType === "SUPERADMIN") {
        if (conversation.user.isGhotokOwned) {
          socket
            .to(`team-notification-${conversation.user.ghotokId}`)
            .emit("user-superadmin-chat:notification", payload.conversationId);
        } else {
          socket
            .to(`user-notification-${userId}`)
            .emit("user-superadmin-chat:notification", payload.conversationId);
        }
      }
    } catch (error) {
      console.error("Error sending team message:", error);
      socket.emit("team-message-error", {
        error: "Failed to send team message",
      });
    }
  }

  private async handleTeamDisconnect(socket: AuthenticatedTeamUserSocket) {
    try {
      await this.redisService.cleanupTeamUserData(socket.user!.id);
      console.log("🏢 Team socket disconnected:", socket.id);
    } catch (error) {
      console.error("Error during team disconnect:", error);
    }
  }

  public getIO() {
    return this.io;
  }

  public getNamespace() {
    return this.namespace;
  }
}
