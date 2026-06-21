"use server";

import { IServerResponse } from "@/components/interface/IServerResponse";
import { IMatchedUsers, IUsers } from "@/components/interface/IUsers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

function buildSortWhere(sortBy?: string): Prisma.UserWhereInput {
  const now = new Date();

  switch (sortBy) {
    case "direct-free":
      return {
        isGhotokOwned: false,
        type: "FREE",
      };

    case "direct-paid":
      return {
        isGhotokOwned: false,
        type: "PAID",
        planExpiryDate: { gt: now },
      };

    case "direct-end":
      return {
        isGhotokOwned: false,
        type: "PAID",
        planExpiryDate: { lt: now },
      };

    case "direct-active":
      return {
        isGhotokOwned: false,
        blocked: false,
      };

    case "direct-blocked":
      return {
        isGhotokOwned: false,
        blocked: true,
      };

    case "ghotok-active":
      return {
        isGhotokOwned: true,
        blocked: false,
      };

    case "ghotok-blocked":
      return {
        isGhotokOwned: true,
        blocked: true,
      };

    default:
      return {};
  }
}

export async function getAllGrooms({
  search = "",
  page = 1,
  limit = 10,
  sortBy = "all",
}: {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}): Promise<{
  data: IUsers[];
  total: number;
  totalPages: number;
  page: number;
}> {
  try {
    const PAGE_SIZE = limit || 10;
    const searchTerms = search.trim().split(/\s+/).filter(Boolean);

    const where: Prisma.UserWhereInput = {
      gender: "MALE",
      ...buildSortWhere(sortBy),
      AND: searchTerms.length
        ? searchTerms.map((term) => ({
            OR: [
              {
                firstName: {
                  contains: term,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                middleName: {
                  contains: term,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                lastName: {
                  contains: term,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              { phone: { contains: term, mode: Prisma.QueryMode.insensitive } },
              {
                publicId: {
                  contains: term,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }))
        : undefined,
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        orderBy: { planExpiryDate: "desc" },
        select: {
          id: true,
          publicId: true,
          title: true,
          firstName: true,
          middleName: true,
          lastName: true,
          gender: true,
          phone: true,
          avatar: true,
          type: true,
          isProfileComplete: true,
          blocked: true,
          planExpiryDate: true,
          isGhotokOwned: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  } catch (error) {
    console.error("Error fetching brides:", error);
    return { data: [], total: 0, totalPages: 0, page: 1 };
  }
}

export async function getAllPaidMatchingGrooms(): Promise<IMatchedUsers[]> {
  try {
    const grooms = await prisma.user.findMany({
      where: {
        gender: "MALE",
        hasMatched: true,
      },
      select: {
        id: true,
        title: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        avatar: true,
        type: true,
        isGhotokOwned: true,
        matchingStartDate: true,
        matchingExpiryDate: true,
      },
      orderBy: {
        matchingStartDate: "desc",
      },
    });

    const formattedGrooms = grooms.map((groom) => ({
      ...groom,
      matchingStartDate: groom.matchingStartDate || null,
      matchingExpiryDate: groom.matchingExpiryDate || null,
      isExipired: groom.matchingExpiryDate < new Date(),
    }));

    return formattedGrooms;
  } catch (error) {
    console.error("Error fetching brides:", error);
    return [];
  }
}

export async function deleteBrideOrGroomById(
  id: string
): Promise<IServerResponse> {
  try {
    await prisma.userSession.deleteMany({ where: { userId: id } });
    await prisma.conversation.deleteMany({
      where: { participants: { some: { id } } },
    });
    await prisma.user.delete({ where: { id } });
    return {
      success: true,
      message: "User deleted successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: "Failed to delete user.",
    } as IServerResponse;
  }
}

export async function blockUserById(
  id: string,
  block: boolean
): Promise<IServerResponse | null> {
  try {
    await prisma.userSession.deleteMany({ where: { userId: id } });
    await prisma.user.update({
      where: { id },
      data: { blocked: block },
    });
    return {
      success: true,
      message: block
        ? "User blocked successfully."
        : "User unblocked successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error updating team block status:", error);
    return {
      success: false,
      message: "Failed to update team block status.",
    } as IServerResponse;
  }
}

export async function resetUserPassword(
  id: string,
  newPassword: string
): Promise<IServerResponse | null> {
  try {
    const hashPassword = await bcrypt.hash(newPassword, 10);
    await prisma.userAccount.updateMany({
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
