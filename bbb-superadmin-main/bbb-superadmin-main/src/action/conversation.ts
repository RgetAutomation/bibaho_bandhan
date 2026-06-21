"use server";

import { IAdminModeratorConversationMessages } from "@/components/interface/IAdminModeratorChats";
import {
  IConversation,
  IConversationOnly,
} from "@/components/interface/IConversation";
import {
  IGroomConversationsWithModeratorsResult,
  ITotalConversationsAssaigned,
} from "@/components/interface/IConversationAssign";
import {
  IHistoryAdminModeratorConv,
  IHistoryTeamUserConv,
} from "@/components/interface/IHistoryTeamUserConv";
import { IOldConversation } from "@/components/interface/IOldConversations";
import {
  IPaginatedResult,
  IPaginationParams,
} from "@/components/interface/IPagenation";
import { IServerResponse } from "@/components/interface/IServerResponse";
import { ITeamUserConversation } from "@/components/interface/ITeamUserConversation";
import { prisma } from "@/lib/prisma";

export async function getConversationByParticipantsID(
  id: string
): Promise<IConversationOnly[] | undefined> {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: id,
          },
        },
      },
      select: {
        id: true,
        hasGhotokParticipant: true,
        assignedModerator: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            avatar: true,
          },
        },
        participants: {
          where: {
            NOT: {
              id: id,
            },
          },
          take: 1,
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            avatar: true,
          },
        },
      },
    });

    // Map to flatten participants array into a single object
    const formattedConversations = conversations.map((conv) => ({
      ...conv,
      participant: conv.participants[0], // single participant
      participants: undefined, // optionally remove original array
    }));

    return formattedConversations;
  } catch (error) {
    console.error("Error fetching conversation:", error);
  }
}

export async function getConversationMessages(
  conversationId: string
): Promise<IConversation | null> {
  try {
    const messages = await prisma.conversation.findFirst({
      where: { id: conversationId },
      select: {
        id: true,
        participants: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            avatar: true,
          },
        },
        messages: {
          select: {
            id: true,
            senderId: true,
            receiverId: true,
            content: true,
            createdAt: true,
            status: true,
            moderation: {
              select: {
                reason: true,
                status: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    return messages;
  } catch (error) {
    console.error("Error fetching matching report:", error);
    return null;
  }
}

// get all old conversation which last message is older than 6 months
export async function getAllOldConversation(
  month: number = 3
): Promise<IOldConversation[]> {
  try {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

    const monthAgo =
      month === 1
        ? oneMonthAgo
        : month === 2
          ? twoMonthsAgo
          : month === 3
            ? threeMonthsAgo
            : sixMonthsAgo;
    const conversation = await prisma.conversation.findMany({
      where: {
        NOT: {
          messages: {
            some: { createdAt: { gt: monthAgo } }, // no recent messages
          },
        },
        messages: {
          some: {
            createdAt: { lt: monthAgo },
          },
        },
      },
      select: {
        id: true,
        convId: true,
        participants: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            avatar: true,
          },
        },
        messages: {
          select: {
            id: true,
            senderId: true,
            receiverId: true,
            content: true,
            createdAt: true,
            status: true,
          },
          orderBy: {
            createdAt: "asc",
          },
          take: 1,
        },
      },
    });

    const formattedConversations = conversation.map((conv) => ({
      id: conv.id,
      convId: conv.convId,
      participants: conv.participants, // single participant
      lastMessage: conv.messages[0],
    }));

    return formattedConversations;
  } catch (error) {
    console.error("Error fetching old conversation:", error);
    return [];
  }
}

export async function getTeamUserConversationMessages(
  conversationId: string
): Promise<ITeamUserConversation | null> {
  try {
    const messages = await prisma.teamUserConversation.findFirst({
      where: { id: conversationId },
      select: {
        team: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            avatar: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            avatar: true,
          },
        },
        messages: {
          select: {
            id: true,
            senderTeamId: true,
            senderUserId: true,
            content: true,
            createdAt: true,
            status: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    return messages;
  } catch (error) {
    console.error("Error fetching matching report:", error);
    return null;
  }
}

export async function getAdminModeratorConversationMessages(
  conversationId: string
): Promise<IAdminModeratorConversationMessages | null> {
  try {
    const messages = await prisma.adminModeratorConversation.findUnique({
      where: { id: conversationId },
      select: {
        participants: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            avatar: true,
          },
        },
        messages: {
          select: {
            id: true,
            senderTeamId: true,
            template: {
              select: {
                content: true,
              },
            },
            createdAt: true,
            status: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!messages) return null;

    const formattedData = {
      messages: messages?.messages.map((message) => ({
        ...message,
        content: message.template?.content,
      })),
      participants: messages?.participants || [], // Provide a default value if participants is undefined
    };

    return formattedData;
  } catch (error) {
    console.error("Error fetching matching report:", error);
    return null;
  }
}

export async function deleteConversationChatById(
  id: string
): Promise<IServerResponse> {
  try {
    await prisma.message.deleteMany({ where: { conversationId: id } });
    return {
      success: true,
      message: "Chats deleted successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return {
      success: false,
      message: "Failed to delete conversation.",
    } as IServerResponse;
  }
}

export async function getUserTeamConversationByTeamId(
  teamId: string
): Promise<IHistoryTeamUserConv[]> {
  try {
    const conversations = await prisma.teamUserConversation.findMany({
      where: {
        teamId,
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            avatar: true,
          },
        },
      },
    });
    return conversations;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return [];
  }
}

export async function getGroomConversationsWithModerators({
  page = 1,
  limit = 10,
}: IPaginationParams): Promise<IGroomConversationsWithModeratorsResult> {
  const pageNum = Number(page);
  const limitNum = Number(limit);

  if (pageNum < 1 || limitNum < 1) {
    throw new Error("Invalid pagination parameters");
  }

  const skip = (pageNum - 1) * limitNum;

  const [conversations, totalData, moderators] = await prisma.$transaction([
    // 1️⃣ Conversations
    prisma.conversation.findMany({
      where: {
        hasGhotokParticipant: true,
        assignedModeratorId: null,
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
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),

    // 2️⃣ Total count
    prisma.conversation.count({
      where: {
        hasGhotokParticipant: true,
        assignedModeratorId: null,
      },
    }),

    // 3️⃣ Moderators list (Team table)
    prisma.team.findMany({
      where: {
        role: "MODERATOR", // adjust if enum differs
        blocked: false,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        internalId: true,
        avatar: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalData / limitNum);

  // 🔒 Avatar privacy rule
  const processedConversations = conversations.map((c) => ({
    ...c,
    participants: c.participants.map((p) => ({
      ...p,
    })),
  }));

  return {
    conversations: {
      totalData,
      totalPages,
      currentPage: pageNum,
      pageSize: limitNum,
      data: processedConversations,
    },
    moderators,
  };
}

export async function getAdminModeratorConversationByTeamId(
  teamId: string
): Promise<IHistoryAdminModeratorConv[]> {
  try {
    const conversations = await prisma.adminModeratorConversation.findMany({
      where: {
        participants: {
          some: {
            id: teamId,
          },
        },
      },
      select: {
        id: true,
        participants: {
          where: {
            NOT: {
              id: teamId,
            },
          },
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
      },
    });

    const processedConversations = conversations.map((c) => ({
      ...c,
      participants: c.participants[0],
    }));

    return processedConversations;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return [];
  }
}

export async function assignConversationToModerator(
  userId: string,
  conversationIds: string[],
  moderatorId: string
) {
  try {
    // Update all conversations in a transaction
    await prisma.$transaction(
      conversationIds.flatMap((id) => [
        // 1️⃣ Update the conversation
        prisma.conversation.update({
          where: { id },
          data: { assignedModeratorId: moderatorId },
        }),

        // 2️⃣ Assign moderator to pending message moderations
        prisma.messageModeration.updateMany({
          where: {
            moderatorId: null,
            status: "PENDING",
            message: {
              conversationId: id,
            },
          },
          data: {
            moderatorId,
          },
        }),

        // 3️⃣ Create the audit log
        prisma.convsersationAssignedAuditLogs.create({
          data: {
            conversationId: id,
            moderatorId,
            adminId: userId,
          },
        }),
      ])
    );

    return {
      success: true,
      message: "Conversation assigned successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error assigning conversation:", error);
    return {
      success: false,
      message: "Failed to assign conversation.",
    } as IServerResponse;
  }
}

export async function getTotalAssignedConversationsLog({
  page = 1,
  limit = 10,
  days = 7,
}: {
  page: number;
  limit: number;
  days: number;
}): Promise<IPaginatedResult<ITotalConversationsAssaigned[]> | null> {
  try {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const daysNum = Number(days);

    if (pageNum < 1 || limitNum < 1 || daysNum < 7) {
      throw new Error("Invalid pagination parameters");
    }

    const skip = (pageNum - 1) * limitNum;

    const today = new Date();
    const startDate = new Date(today.getTime() - daysNum * 24 * 60 * 60 * 1000);

    const [conversationAssignedAuditLogs, totalData] =
      await prisma.$transaction([
        prisma.convsersationAssignedAuditLogs.findMany({
          where: {
            createdAt: { gte: startDate },
          },
          select: {
            id: true,
            conversation: {
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
                  },
                },
              },
            },
            admin: {
              select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
                avatar: true,
                internalId: true,
              },
            },
            moderator: {
              select: {
                id: true,
                internalId: true,
                firstName: true,
                middleName: true,
                lastName: true,
                avatar: true,
              },
            },
            createdAt: true,
          },

          skip,
          take: limitNum,
          orderBy: { createdAt: "desc" },
        }),
        prisma.convsersationAssignedAuditLogs.count(),
      ]);

    const totalPages = Math.ceil(totalData / limitNum);

    return {
      totalData,
      totalPages,
      currentPage: pageNum,
      pageSize: limitNum,
      data: conversationAssignedAuditLogs,
    };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return null;
  }
}

export async function deleteTeamUserConversationById(
  id: string
): Promise<IServerResponse> {
  try {
    await prisma.teamUserConversation.delete({ where: { id } });
    return {
      success: true,
      message: "Conversation deleted successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return {
      success: false,
      message: "Failed to delete conversation.",
    } as IServerResponse;
  }
}

export async function deleteAdminModeratorMessageConversationById(
  id: string
): Promise<IServerResponse> {
  try {
    await prisma.adminModeratorMessage.deleteMany({
      where: { conversationId: id },
    });
    return {
      success: true,
      message: "Messages deleted successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return {
      success: false,
      message: "Failed to delete messages.",
    } as IServerResponse;
  }
}

export interface ITeamUserSingleMessage {
  id: string;
  content: string;
  status: string;
  createdAt: Date;
}

export async function getTeamUserMessageData(
  messageId: string
): Promise<ITeamUserSingleMessage | null> {
  try {
    const message = await prisma.teamUserMessage.findUnique({
      where: {
        id: messageId,
      },
      select: {
        id: true,
        content: true,
        status: true,
        createdAt: true,
      },
    });
    return message;
  } catch (error) {
    console.error("Error deleting message:", error);
    return null;
  }
}

export async function deleteTeamUserMessageData(
  messageId: string
): Promise<IServerResponse> {
  try {
    await prisma.teamUserMessage.delete({
      where: {
        id: messageId,
      },
    });
    return {
      success: true,
      message: "Message deleted successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error deleting message:", error);
    return {
      success: false,
      message: "Failed to delete message.",
    } as IServerResponse;
  }
}

export async function getAllGroomsConversations(): Promise<any[]> {
  try {
    const conversations = await prisma.teamUserConversation.findMany({
      where: {
        user: { gender: "MALE" },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            title: true,
            lastName: true,
            gender: true,
            avatar: true,
          },
        },
        messages: {
          select: {
            id: true,
            content: true,
            senderTeamId: true,
            senderUserId: true,
            type: true,
            paymentPhase: true,
            status: true,
            createdAt: true,
            senderTeam: {
              select: {
                internalId: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return conversations.map((conv) => ({
      id: conv.id,
      user: conv.user,
      lastMessage: conv.messages[0],
    }));
  } catch (error) {
    console.error("Error fetching grooms conversations:", error);
    return [];
  }
}

export async function getAllBridesConversations(): Promise<any[]> {
  try {
    const conversations = await prisma.teamUserConversation.findMany({
      where: {
        user: { gender: "FEMALE" },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            title: true,
            lastName: true,
            gender: true,
            avatar: true,
          },
        },
        messages: {
          select: {
            id: true,
            content: true,
            senderTeamId: true,
            senderUserId: true,
            type: true,
            paymentPhase: true,
            status: true,
            createdAt: true,
            senderTeam: {
              select: {
                internalId: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return conversations.map((conv) => ({
      id: conv.id,
      user: conv.user,
      lastMessage: conv.messages[0],
    }));
  } catch (error) {
    console.error("Error fetching brides conversations:", error);
    return [];
  }
}
