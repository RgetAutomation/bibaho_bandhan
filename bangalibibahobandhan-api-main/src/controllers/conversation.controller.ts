import { Request, Response } from "express";
import { prisma } from "../config/db.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { UserTeamConversationType } from "../utils/enum/UserTeamConversationType.js";
import { Role } from "../types/roles.js";
import { ChatValidationService } from "../utils/ChatValidationService.js";
import { Gender } from "../types/gender.js";
import { RoleConversationType } from "../types/RoleConversationType.js";

export async function getUserConversationByConvId(req: Request, res: Response) {
  try {
    const conversationId = req.params?.convId;

    if (!conversationId) {
      return res
        .status(400)
        .json(new ApiError(400, "Conversation Id is required"));
    }

    // 1) try to find existing conversation
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId },
      select: {
        id: true,
        participants: {
          select: {
            id: true,
            title: true,
            lastName: true,
            gender: true,
          },
        },
        messages: {
          where: {
            OR: [
              {
                moderation: null, // messages without moderation
              },
              {
                moderation: {
                  status: "APPROVED",
                },
              },
            ],
          },
          select: {
            id: true,
            senderId: true,
            receiverId: true,
            content: true,
            createdAt: true,
          },
          take: 50,
        },
      },
    });

    if (!conversation) {
      return res.status(404).json(new ApiError(404, "Conversation not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Conversation details fetched", conversation));
  } catch (err: any) {
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getAdminUserConversationDetails(
  req: Request,
  res: Response
) {
  try {
    const conversationId = req.params?.convId;

    if (!conversationId) {
      return res
        .status(400)
        .json(new ApiError(400, "Conversation Id is required"));
    }

    // 1) try to find existing conversation
    const conversation = await prisma.teamUserConversation.findFirst({
      where: { id: conversationId },
      select: {
        id: true,
        team: { select: { id: true } },
        user: {
          select: { id: true, title: true, lastName: true, avatar: true },
        },
        type: true,
        messages: true,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Conversation details fetched", conversation));
  } catch (err: any) {
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function sendAdminUserMessage(req: Request, res: Response) {
  try {
    const { content, conversationId, senderTeamId, senderUserId } = req.body;
    if (!conversationId || !content)
      return res.status(400).json(new ApiError(400, "Missing required fields"));

    const message = await prisma.teamUserMessage.create({
      data: { conversationId, content, senderTeamId, senderUserId },
    });
    res.json(new ApiResponse(200, "Message sent successfully", message));
  } catch (err: any) {
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

/********************** ADMIN MODERATOR CONVERSATION *************************/

export async function getOrCreateAdminModeratorConversation(
  req: Request,
  res: Response
) {
  try {
    const currentTeamId = req.systemUser?.id;
    const { teamId } = req.params;

    if (!currentTeamId) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized: team not found"));
    }

    if (!teamId) {
      return res.status(400).json(new ApiError(400, "TeamID is required"));
    }

    let conversation = await prisma.adminModeratorConversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { id: currentTeamId },
            },
          },
          {
            participants: {
              some: { id: teamId },
            },
          },
        ],
      },
    });

    // 2) create if not found
    if (!conversation) {
      conversation = await prisma.adminModeratorConversation.create({
        data: {
          participants: {
            connect: [{ id: currentTeamId }, { id: teamId }],
          },
        },
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Conversation found", conversation.id));
  } catch (err: any) {
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getAllAdminModeratorConversation(
  req: Request,
  res: Response
) {
  try {
    const currentTeamId = req.systemUser?.id;

    if (!currentTeamId) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized: team not found"));
    }

    const conversation = await prisma.adminModeratorConversation.findMany({
      where: {
        participants: {
          some: { id: currentTeamId },
        },
      },
      select: {
        id: true,
        participants: {
          where: {
            NOT: { id: currentTeamId },
          },
          select: {
            id: true,
            internalId: true,
            gender: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Conversation found", conversation));
  } catch (err: any) {
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getConversationAndMessages(req: Request, res: Response) {
  try {
    const currentTeam = req.systemUser;
    const currentTeamId = currentTeam?.id;
    const { convId } = req.params;

    if (!currentTeamId) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized: team not found"));
    }

    if (!convId) {
      return res
        .status(400)
        .json(new ApiError(400, "ConversationID is required"));
    }

    const [conversation, templates] = await prisma.$transaction([
      prisma.adminModeratorConversation.findFirst({
        where: {
          id: convId,
        },
        select: {
          participants: {
            where: {
              NOT: { id: currentTeamId },
            },
            select: {
              id: true,
              internalId: true,
              gender: true,
              role: true,
            },
            take: 1,
          },
          messages: {
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
              template: {
                select: {
                  content: true,
                },
              },
              senderTeamId: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.messageTemplate.findMany({
        where: {
          roles: {
            hasSome: [currentTeam.role], // use `hasSome` for Postgres array field
          },
          isActive: true,
          category: "ADMIN_MODERATOR",
        },
        select: {
          id: true,
          content: true,
          name: true,
        },
      }),
    ]);

    if (!conversation) {
      return res.status(404).json(new ApiError(404, "Conversation not found"));
    }

    const formattedMessages = conversation.messages.map((message) => ({
      id: message.id,
      content: message.template?.content,
      senderTeamId: message.senderTeamId,
      createdAt: message.createdAt,
    }));

    return res.status(200).json(
      new ApiResponse(200, "Conversation found", {
        participant: conversation.participants[0],
        messages: formattedMessages,
        templates,
      })
    );
  } catch (err: any) {
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getAllTeamUserConversation(req: Request, res: Response) {
  try {
    const currentTeamId = req.systemUser?.id;

    if (!currentTeamId) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized: team not found"));
    }

    const conversation = await prisma.teamUserConversation.findMany({
      where: {
        teamId: currentTeamId,
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            title: true,
            lastName: true,
            gender: true,
          },
        },
        //Get last message
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            senderTeamId: true,
            senderUserId: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    const formattedconversations = conversation.map((conversation) => ({
      id: conversation.id,
      user: conversation.user,
      lastMessage: conversation.messages[0],
    }));
    return res
      .status(200)
      .json(new ApiResponse(200, "Conversation found", formattedconversations));
  } catch (err: any) {
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getOrCreateTeamUserConversation(
  req: Request,
  res: Response
) {
  try {
    const chatValidation = new ChatValidationService();
    const currentTeam = req.systemUser;
    const currentTeamId = currentTeam?.id;
    const currentTeamRole = currentTeam?.role;
    const { userId } = req.params;

    if (!currentTeamId) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized: team not found"));
    }

    if (!userId) {
      return res.status(400).json(new ApiError(400, "UserID is required"));
    }

    const requestedUser = await prisma.user.findFirst({
      where: { id: userId },
      select: { gender: true, blocked: true },
    });

    if (!requestedUser) {
      res.status(400).json(new ApiError(400, "User not found"));
    }

    if (currentTeamId === userId) {
      return res
        .status(400)
        .json(new ApiError(400, "You cannot chat with yourself"));
    }

    if (requestedUser?.blocked) {
      return res.status(400).json(new ApiError(400, "User is blocked"));
    }

    const validation = chatValidation.canChat(
      currentTeamRole as Role,
      requestedUser?.gender as Gender
    );
    if (!validation.allowed) {
      return res
        .status(400)
        .json(new ApiError(400, validation.reason || "Access denied"));
    }
    // default conversation type if caller doesn't supply one
    const convoType =
      currentTeamRole === Role.ADMIN
        ? UserTeamConversationType.ADMIN_GROOM
        : UserTeamConversationType.MODERATOR_BRIDE;
    let conversation = await prisma.teamUserConversation.findFirst({
      where: {
        teamId: currentTeamId,
        userId: userId,
        type: convoType,
      },
    });

    // 2) create if not found
    if (!conversation) {
      conversation = await prisma.teamUserConversation.create({
        data: {
          teamId: currentTeamId,
          userId: userId,
          type: convoType,
        },
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Conversation found", conversation.id));
  } catch (err: any) {
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getTeamUserConversationAndMessages(
  req: Request,
  res: Response
) {
  try {
    const currentTeam = req.systemUser;
    const currentTeamId = currentTeam?.id;
    const { convId } = req.params;

    if (!currentTeamId) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized: team not found"));
    }

    if (!convId) {
      return res
        .status(400)
        .json(new ApiError(400, "ConversationID is required"));
    }

    const conversation = await prisma.teamUserConversation.findUnique({
      where: {
        id: convId,
      },
      select: {
        user: {
          select: {
            id: true,
            title: true,
            lastName: true,
            gender: true,
          },
        },
        messages: {
          select: {
            id: true,
            content: true,
            senderTeamId: true,
            senderUserId: true,
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
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json(new ApiError(404, "Conversation not found"));
    }

    return res.status(200).json(
      new ApiResponse(200, "Conversation found", {
        participant: conversation.user,
        messages: conversation.messages.map((message) => ({
          id: message.id,
          content: message.content,
          senderTeamId: message.senderTeamId,
          senderUserId: message.senderUserId,
          type: message.type,
          planId: message.plan?.id,
          planTitle: message.plan?.title,
          planPrice: message.plan?.price,
          planDuration: message.plan?.duration,
          paymentPhase: message.paymentPhase,
          status: message.status,
          createdAt: message.createdAt,
        })),
      })
    );
  } catch (err: any) {
    console.log(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getOrCreateConversationWithSA(
  req: Request,
  res: Response
) {
  try {
    const currentUser = req.systemUser;

    if (!currentUser) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized: team not found"));
    }

    let messageType: RoleConversationType | undefined;

    if (currentUser.role === Role.ADMIN)
      messageType = RoleConversationType.SUPERADMIN_ADMIN;
    else if (currentUser.role === Role.MODERATOR)
      messageType = RoleConversationType.SUPERADMIN_MODERATOR;
    else if (currentUser.role === Role.GHOTOK)
      messageType = RoleConversationType.SUPERADMIN_GHOTOK;

    const conversation = await prisma.$transaction(async (tx) => {
      // 1️⃣ Find SuperAdmin
      const superAdmin = await tx.team.findFirst({
        where: { role: Role.SUPERADMIN },
        orderBy: { createdAt: "asc" },
      });

      if (!superAdmin) throw new Error("No SuperAdmin found");

      // 2️⃣ Try to find conversation
      let convo = await tx.teamConversation.findFirst({
        where: {
          AND: [
            { participants: { some: { id: superAdmin.id } } },
            { participants: { some: { id: currentUser.id } } },
          ],
        },
        select: {
          id: true,
          participants: {
            where: { NOT: { id: currentUser.id } },
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              gender: true,
              avatar: true,
            },
            take: 1,
          },
          messages: {
            select: {
              id: true,
              content: true,
              senderTeamId: true,
              status: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      // 3️⃣ Create conversation if not exists
      if (!convo) {
        convo = await tx.teamConversation.create({
          data: {
            participants: {
              connect: [{ id: superAdmin.id }, { id: currentUser.id }],
            },
            type: messageType as RoleConversationType,
          },
          select: {
            id: true,
            participants: {
              where: { NOT: { id: currentUser.id } },
              select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
                gender: true,
                avatar: true,
              },
              take: 1,
            },
            messages: {
              select: {
                id: true,
                content: true,
                senderTeamId: true,
                status: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        });
      }

      return convo;
    });

    const formattedData = {
      id: conversation.id,
      participants: conversation.participants[0],
      messages: conversation.messages,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, "Plans fetched successfully", formattedData));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getOrCreateConversationForSA(
  req: Request,
  res: Response
) {
  try {
    //Alwasys Super Admin
    const currentUser = req.systemUser;
    const { userId } = req.params;

    if (!currentUser) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized: team not found"));
    }

    if (!userId) {
      return res.status(400).json(new ApiError(400, "UserID is required"));
    }

    const requestedUser = await prisma.team.findFirst({
      where: { id: userId },
      select: { id: true, role: true },
    });

    let messageType: RoleConversationType | undefined;

    if (requestedUser?.role === Role.ADMIN)
      messageType = RoleConversationType.SUPERADMIN_ADMIN;
    else if (requestedUser?.role === Role.MODERATOR)
      messageType = RoleConversationType.SUPERADMIN_MODERATOR;
    else if (requestedUser?.role === Role.GHOTOK)
      messageType = RoleConversationType.SUPERADMIN_GHOTOK;

    const conversation = await prisma.$transaction(async (tx) => {
      // 2️⃣ Try to find conversation
      let convo = await tx.teamConversation.findFirst({
        where: {
          AND: [
            { participants: { some: { id: requestedUser?.id } } },
            { participants: { some: { id: currentUser.id } } },
          ],
        },
      });

      // 3️⃣ Create conversation if not exists
      if (!convo) {
        convo = await tx.teamConversation.create({
          data: {
            participants: {
              connect: [{ id: requestedUser?.id }, { id: currentUser.id }],
            },
            type: messageType as RoleConversationType,
          },
        });
      }

      return convo;
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Conversation ID fetched successfully",
          conversation.id
        )
      );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getConversationDetailsForSA(req: Request, res: Response) {
  try {
    //Alwasys Super Admin
    const currentUser = req.systemUser;
    const { convId } = req.params;

    if (!currentUser) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized: team not found"));
    }

    if (!convId) {
      return res
        .status(400)
        .json(new ApiError(400, "ConversationID is required"));
    }

    const conversation = await prisma.teamConversation.findFirst({
      where: {
        id: convId,
      },
      select: {
        id: true,
        participants: {
          where: { NOT: { id: currentUser.id } },
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            avatar: true,
          },
          take: 1,
        },
        messages: {
          select: {
            id: true,
            content: true,
            senderTeamId: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json(new ApiError(404, "Conversation not found"));
    }

    const formattedData = {
      id: conversation.id,
      participants: conversation.participants[0],
      messages: conversation.messages,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, "Plans fetched successfully", formattedData));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getGhotokUserConversationDetails(
  req: Request,
  res: Response
) {
  try {
    //Alwasys Super Admin
    const currentUser = req.systemUser;
    const { convId } = req.params;

    if (!currentUser) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized: team not found"));
    }

    if (!convId) {
      return res
        .status(400)
        .json(new ApiError(400, "ConversationID is required"));
    }

    const result = await prisma.$transaction(async (tx) => {
      const myUser = await tx.user.findFirst({
        where: {
          conversations: {
            some: {
              id: convId,
            },
          },
          isGhotokOwned: true,
          ghotokId: currentUser.id,
        },
        select: {
          id: true,
        },
      });

      const conversation = await tx.conversation.findFirst({
        where: {
          id: convId,
        },
        select: {
          id: true,
          convId: true,
          participants: {
            select: {
              id: true,
              title: true,
              firstName: true,
              middleName: true,
              lastName: true,
              gender: true,
              avatar: true,
              ghotokId: true,
            },
          },
          messages: {
            where: {
              OR: [
                ...(myUser?.id
                  ? [
                      {
                        senderId: myUser.id, // messages sent by me
                      },
                    ]
                  : []),
                {
                  moderation: {
                    status: "APPROVED", // messages from others must be approved
                  },
                },
              ],
            },
            select: {
              id: true,
              content: true,
              conversationId: true,
              senderId: true,
              receiverId: true,
              status: true,
              createdAt: true,
              moderation: {
                select: {
                  status: true,
                  reason: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      return { myUser, conversation };
    });

    const { myUser, conversation } = result;

    if (!conversation) {
      return res.status(404).json(new ApiError(404, "Conversation not found"));
    }

    const formattedData = {
      id: conversation.id,
      convId: conversation.convId,
      participants: conversation.participants.map((participant) => ({
        id: participant.id,
        title: participant.title,
        ...(currentUser.id === participant.ghotokId && {
          firstName: participant.firstName,
          middleName: participant.middleName,
        }),
        lastName: participant.lastName,
        gender: participant.gender,
        avatar: participant.avatar,
        ghotokId: participant.ghotokId,
      })),
      messages: conversation.messages,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, "Plans fetched successfully", formattedData));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}
