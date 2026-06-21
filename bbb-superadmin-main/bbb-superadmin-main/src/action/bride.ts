"use server";

import { IBrideProfileForChat, IUsers } from "@/components/interface/IUsers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function buildSortWhere(sortBy?: string): Prisma.UserWhereInput {
  switch (sortBy) {
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

export async function getAllBrides({
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
      gender: "FEMALE",
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
        orderBy: { createdAt: "desc" },
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
          allowSocialPublish: true,
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

export async function getBrideProfileById(
  id: string
): Promise<IBrideProfileForChat | null> {
  try {
    if (!id) return null;
    const bride = await prisma.user.findUnique({
      where: { id, gender: "FEMALE" },
      select: {
        id: true,
        publicId: true,
        title: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        avatar: true,
      },
    });
    return bride;
  } catch (error) {
    console.error("Error fetching bride:", error);
    return null;
  }
}

export async function getBrideProfileIdByPublicId(
  id: string
): Promise<string | null> {
  try {
    if (!id) return null;
    const bride = await prisma.user.findUnique({
      where: { publicId: id, gender: "FEMALE" },
      select: {
        id: true,
      },
    });
    return bride?.id ?? null;
  } catch (error) {
    console.error("Error fetching bride:", error);
    return null;
  }
}
