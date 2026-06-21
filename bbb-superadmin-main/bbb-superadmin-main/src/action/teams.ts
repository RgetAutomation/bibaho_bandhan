"use server";

import {
  ITeam,
  ITeams,
  ITeamsForChat,
  ITeamsForPayment,
} from "@/components/interface/ITeam";
import { IServerResponse } from "@/components/interface/IServerResponse";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/components/enum/userRole";
import bcrypt from "bcrypt";

export async function getAllAdmins(): Promise<ITeams[]> {
  try {
    const admins = await prisma.team.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
        internalId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        email: true,
        phone: true,
        blocked: true,
        isProfileComplete: true,
        avatar: true,
        role: true,
      },
    });
    return admins;
  } catch (error) {
    console.error("Error fetching admins:", error);
    return [];
  }
}

export async function getAllAdminsForPayment(): Promise<ITeamsForPayment[]> {
  try {
    const admins = await prisma.team.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
        internalId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        avatar: true,
      },
    });
    return admins;
  } catch (error) {
    console.error("Error fetching admins:", error);
    return [];
  }
}

export async function getAllAdminsForChat(): Promise<ITeamsForChat[]> {
  try {
    const admins = await prisma.team.findMany({
      where: {
        role: UserRole.ADMIN,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        avatar: true,
        teamConversations: {
          select: {
            id: true,
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              select: {
                id: true,
                senderTeamId: true,
                content: true,
              },
              take: 1,
            },
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const formattedAdmins = admins.map((admin) => ({
      ...admin,
      conversationId: admin.teamConversations[0]?.id,
      lastMessage: {
        id: admin.teamConversations[0]?.messages[0]?.id,
        senderTeamId: admin.teamConversations[0]?.messages[0]?.senderTeamId,
        content: admin.teamConversations[0]?.messages[0]?.content,
      },
    }));
    return formattedAdmins;
  } catch (error) {
    console.error("Error fetching admins:", error);
    return [];
  }
}

export async function getAllTeamMembers(): Promise<ITeams[]> {
  try {
    const teams = await prisma.team.findMany({
      where: {
        role: "MODERATOR",
      },
      select: {
        id: true,
        internalId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        email: true,
        phone: true,
        blocked: true,
        isProfileComplete: true,
        avatar: true,
        role: true,
      },
    });
    return teams;
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
}

export async function getAllModeratorsForChat(): Promise<ITeamsForChat[]> {
  try {
    const moderators = await prisma.team.findMany({
      where: {
        role: UserRole.MODERATOR,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        avatar: true,
        teamConversations: {
          select: {
            id: true,
            messages: {
              orderBy: {
                createdAt: "asc",
              },
              select: {
                id: true,
                senderTeamId: true,
                content: true,
              },
              take: 1,
            },
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const formattedModerators = moderators.map((moderator) => ({
      ...moderator,
      conversationId: moderator.teamConversations[0]?.id,
      lastMessage: {
        id: moderator.teamConversations[0]?.messages[0]?.id,
        senderTeamId: moderator.teamConversations[0]?.messages[0]?.senderTeamId,
        content: moderator.teamConversations[0]?.messages[0]?.content,
      },
    }));
    return formattedModerators;
  } catch (error) {
    console.error("Error fetching moderators:", error);
    return [];
  }
}

export async function getAllGhotoks(): Promise<ITeams[]> {
  try {
    const ghotoks = await prisma.team.findMany({
      where: {
        role: "GHOTOK",
      },
      select: {
        id: true,
        internalId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        email: true,
        phone: true,
        blocked: true,
        isProfileComplete: true,
        avatar: true,
        role: true,
      },
    });
    return ghotoks;
  } catch (error) {
    console.error("Error fetching ghotoks:", error);
    return [];
  }
}

export async function getAllGhotoksForChat(): Promise<ITeamsForChat[]> {
  try {
    const ghotoks = await prisma.team.findMany({
      where: {
        role: UserRole.GHOTOK,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        avatar: true,
        teamConversations: {
          select: {
            id: true,
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              select: {
                id: true,
                senderTeamId: true,
                content: true,
              },
              take: 1,
            },
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const formattedGhotoks = ghotoks.map((ghotok) => ({
      ...ghotok,
      conversationId: ghotok.teamConversations[0]?.id,
      lastMessage: {
        id: ghotok.teamConversations[0]?.messages[0]?.id,
        senderTeamId: ghotok.teamConversations[0]?.messages[0]?.senderTeamId,
        content: ghotok.teamConversations[0]?.messages[0]?.content,
      },
    }));
    return formattedGhotoks;
  } catch (error) {
    console.error("Error fetching ghotoks:", error);
    return [];
  }
}

export async function getTeamById(id: string): Promise<ITeam | null> {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        internalId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        phone: true,
        email: true,
        role: true,
        blocked: true,
        isProfileComplete: true,
        avatar: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            dob: true,
            identificationProof: true,
            addressLine1: true,
            addressLine2: true,
            postOffice: true,
            policeStation: true,
            dist: true,
            state: true,
            pinCode: true,
          },
        },
      },
    });
    return team;
  } catch (error) {
    console.error("Error fetching team:", error);
    return null;
  }
}

export async function resetTeamPassword(
  id: string,
  newPassword: string
): Promise<IServerResponse | null> {
  try {
    const hashPassword = await bcrypt.hash(newPassword, 10);
    await prisma.teamAccount.updateMany({
      where: { userId: id },
      data: { password: hashPassword },
    });
    return {
      success: true,
      message: "Password reset successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error updating team block status:", error);
    return {
      success: false,
      message: "Failed to reset password.",
    } as IServerResponse;
  }
}

export async function blockTeamById(
  id: string,
  block: boolean
): Promise<IServerResponse | null> {
  try {
    await prisma.teamSession.deleteMany({ where: { userId: id } });
    await prisma.team.update({
      where: { id },
      data: { blocked: block },
    });
    return {
      success: true,
      message: block
        ? "Team blocked successfully."
        : "Team unblocked successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error updating team block status:", error);
    return {
      success: false,
      message: "Failed to update team block status.",
    } as IServerResponse;
  }
}

export async function deleteTeamById(
  id: string
): Promise<IServerResponse | null> {
  try {
    await prisma.teamSession.deleteMany({ where: { userId: id } });
    const team = await prisma.team.delete({
      where: { id },
    });
    return {
      success: true,
      message: `${team.firstName} ${team.middleName} ${team.lastName} deleted successfully.`,
    } as IServerResponse;
  } catch (error) {
    console.error("Error deleting team:", error);
    return {
      success: false,
      message: "Failed to delete team.",
    } as IServerResponse;
  }
}

export interface IRejectedMessage {
  id: string;
  conversationId: string;
  content: string;
  reason?: string | null;
  createdAt: Date;
  moderator: {
    id: string | undefined;
    firstName: string | undefined;
    middleName: string | undefined | null;
    lastName: string | undefined;
    avatar: string | null | undefined;
    gender: string | undefined;
  } | null;
}

export async function getAllRejectedMessages({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}): Promise<{
  data: IRejectedMessage[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    const skip = (page - 1) * limit;

    const [rejectedMessages, totalData] = await prisma.$transaction([
      prisma.message.findMany({
        where: {
          moderation: {
            status: "REJECTED",
          },
        },
        select: {
          id: true,
          content: true,
          conversation: {
            select: {
              id: true,
            },
          },
          moderation: {
            select: {
              reason: true,
              moderator: {
                select: {
                  id: true,
                  firstName: true,
                  middleName: true,
                  lastName: true,
                  avatar: true,
                  gender: true,
                },
              },
            },
          },
          createdAt: true,
        },

        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.message.count({
        where: {
          moderation: {
            status: "REJECTED",
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalData / limit);

    // post-process: remove avatar for non-MALE
    const processedConversations = rejectedMessages.map((c) => ({
      id: c.id,
      conversationId: c.conversation.id,
      content: c.content,
      reason: c.moderation?.reason,
      createdAt: c.createdAt,
      moderator: {
        id: c.moderation?.moderator?.id,
        firstName: c.moderation?.moderator?.firstName,
        middleName: c.moderation?.moderator?.middleName,
        lastName: c.moderation?.moderator?.lastName,
        avatar: c.moderation?.moderator?.avatar,
        gender: c.moderation?.moderator?.gender,
      },
    }));

    return {
      data: processedConversations,
      total: totalData,
      page,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching brides:", error);
    return { data: [], total: 0, page: 1, totalPages: 0 };
  }
}

export async function deleteTeamSAMessageByConvId(
  convId: string
): Promise<IServerResponse> {
  try {
    await prisma.teamMessage.deleteMany({
      where: {
        conversationId: convId,
      },
    });
    return {
      success: true,
      message: "Messages deleted successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error fetching team by id:", error);
    return {
      success: false,
      message: "Failed to delete conversation.",
    };
  }
}
