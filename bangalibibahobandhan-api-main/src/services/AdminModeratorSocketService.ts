// src/services/team-socket.service.js
import { Server as SocketIOServer } from "socket.io";
import { RedisService } from "./RedisService.js";
import { AuthenticatedTeamSocket } from "../types/jwt-payload.js";
import { prisma } from "../config/db.js";
import { SystemUser } from "../types/user.js";
import { Role } from "../types/roles.js";

export class AdminModeratorSocketService {
  private io: SocketIOServer;
  private redisService: RedisService;
  private namespace: any;

  constructor(server: SocketIOServer) {
    this.io = server;
    // Create separate namespace for team conversations
    this.namespace = this.io.of("/adminmoderator");

    this.redisService = new RedisService();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.namespace.use(this.authenticateSocket.bind(this));
  }

  private async authenticateSocket(socket: AuthenticatedTeamSocket, next: any) {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error("Missing token");
      const realToken = token.split("_")[1];
      if (realToken === "" || realToken === null || realToken === "undefined") {
        throw new Error("Invalid or expired team session");
      }

      const session = await prisma.teamSession.findUnique({
        where: { token: realToken },
        include: { team: true },
      });

      if (!session || !session.team) {
        throw new Error("Invalid or expired team session");
      }

      const teamUser: SystemUser = {
        id: session.team.id,
        role: session.team.role as Role,
        isProfileComplete: session.team.isProfileComplete,
        tokenType: session.team.role === "SUPERADMIN" ? "SUPERADMIN" : "TEAM",
      };
      socket.user = teamUser;
      next();
    } catch (error) {
      next(new Error("Team socket authentication error"));
    }
  }

  private setupEventHandlers() {
    this.namespace.on("connection", async (socket: AuthenticatedTeamSocket) => {
      // console.log(
      //   "🏢 Admin & Moderator socket connected:",
      //   socket.id,
      //   "User:",
      //   socket.user?.id
      // );

      if (!socket.user) return;

      try {
        // Join team conversation rooms
        if (socket.user.tokenType === "TEAM") {
          socket.join(`admin-moderator-notification:${socket.user.id}`);
        }

        socket.on(
          "join-admin-moderator-active-conversations",
          async (data: { conversationId: string }) => {
            await this.joinUserActiveConversations(socket, data.conversationId);
          }
        );

        // Team-specific message events
        socket.on("send-team-message", async (data: any) => {
          await this.handleSendTeamMessage(socket, data);
        });

        socket.on("disconnect", async () => {
          await this.handleTeamDisconnect(socket);
        });
      } catch (error) {
        console.error("Error during team socket connection:", error);
        socket.emit("team-connection-error", {
          error: "Failed to establish team connection",
        });
      }
    });
  }

  private async joinUserActiveConversations(
    socket: AuthenticatedTeamSocket,
    conversationId: string
  ) {
    const roomName = `team-conv:${conversationId}`;
    socket.join(roomName);
  }

  private async handleSendTeamMessage(
    socket: AuthenticatedTeamSocket,
    data: any
  ) {
    try {
      const { conversationId, templateId } = data;

      if (!conversationId || !templateId) {
        socket.emit("message-error", {
          error: "Missing conversationId or templateId",
        });
        return;
      }

      // Verify user is in the conversation room
      // if (!socket.rooms.has(`team-conv:${conversationId}`)) {
      //   socket.emit("message-error", { error: "Not in conversation room" });
      //   return;
      // }

      const saveMessage = await prisma.adminModeratorMessage.create({
        data: {
          conversationId,
          senderTeamId: socket.user!.id,
          templateId,
        },
        select: {
          id: true,
          conversationId: true,
          senderTeamId: true,
          templateId: true,
          status: true,
          createdAt: true,
          template: {
            select: {
              content: true,
            },
          },
          conversation: {
            select: {
              participants: {
                where: {
                  NOT: {
                    id: socket.user!.id,
                  },
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      const notificationRoom = `admin-moderator-notification:${saveMessage.conversation.participants[0]?.id}`;
      const roomName = `team-conv:${conversationId}`;

      const formattedMessage = {
        id: saveMessage.id,
        conversationId: saveMessage.conversationId,
        senderTeamId: saveMessage.senderTeamId,
        templateId: saveMessage.templateId,
        status: saveMessage.status,
        createdAt: saveMessage.createdAt,
        content: saveMessage.template?.content,
      };

      // Emit to all participants in the team conversation
      this.namespace.to(roomName).emit("new-team-message", formattedMessage);
      this.namespace
        .to(notificationRoom)
        .emit("admin-moderator-message:notification", formattedMessage);
      //console.log(`Team message sent to room: ${roomName}`);

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

  private async handleTeamDisconnect(socket: AuthenticatedTeamSocket) {
    try {
      await this.redisService.cleanupTeamUserData(socket.user!.id);
      //console.log("🏢 Team socket disconnected:", socket.id);
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
