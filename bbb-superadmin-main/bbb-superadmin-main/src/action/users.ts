"use server";

import {
  IFullUserWithImages,
  IGroomForChat,
  IUsers,
} from "@/components/interface/IUsers";
import { IServerResponse } from "@/components/interface/IServerResponse";
import { prisma } from "@/lib/prisma";
import { CreateTeamInput } from "@/schema/teamSchema";
import { generateInternalId } from "@/lib/utils";
import { UserGender } from "@/components/enum/userGender";
import bcrypt from "bcrypt";
import { Gender, Prisma, UserType } from "@prisma/client";

function buildSortWhere(sortBy?: string): Prisma.UserWhereInput {
  switch (sortBy) {
    case "grooms":
      return {
        gender: UserGender.MALE,
        allowSocialPublish: true,
        blocked: false,
        type: "PAID",
      };

    case "brides":
      return {
        gender: UserGender.FEMALE,
        allowSocialPublish: true,
        blocked: false,
        type: "PAID",
      };

    default:
      return {
        allowSocialPublish: true,
        blocked: false,
        type: "PAID",
      };
  }
}

export async function getAllSocialShareUser({
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
          email: true,
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
    return { data: [], total: 0, page: 1, totalPages: 1 };
  }
}

export async function createTeamUser(user: CreateTeamInput) {
  try {
    const hashPassword = await bcrypt.hash(user.password, 10);
    // 3. Generate sequential internal ID
    const lastUserId = await prisma.team.findFirst({
      where: { role: user.role as "ADMIN" | "MODERATOR" | "GHOTOK" },
      orderBy: { internalId: "desc" },
      select: { internalId: true },
    });
    const newInternalId = generateInternalId(
      user.role as "ADMIN" | "MODERATOR" | "GHOTOK",
      lastUserId?.internalId ?? 0
    );

    await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          internalId: newInternalId,
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          gender: user.gender as "MALE" | "FEMALE",
          phone: user.phone,
          username: user.phone,
          displayUsername: user.phone,
          email: user.email ?? "",
          role: user.role as "ADMIN" | "MODERATOR" | "GHOTOK",
        },
      });

      await tx.teamAccount.create({
        data: {
          accountId: team.id,
          providerId: "credential",
          userId: team.id,
          password: hashPassword,
        },
      });
    });

    return {
      success: true,
      message: "Team user created successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error creating team user:", error);
    return {
      success: false,
      message: "Failed to create team user.",
    } as IServerResponse;
  }
}

export async function getUserById(
  id: string
): Promise<IFullUserWithImages | null> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        publicId: true,
        title: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        phone: true,
        email: true,
        type: true,
        blocked: true,
        isProfileComplete: true,
        avatar: true,
        createdAt: true,
        planExpiryDate: true,
        isGhotokOwned: true,
        isProfilePublic: true,
        allowSocialPublish: true,
        profile: {
          select: {
            id: true,
            dob: true,
            maritalStatus: true,
            children: true,
            speciallyAble: true,
            whatsappNumber: true,
            alternatePhone: true,
            religion: true,
            gotra: true,
            caste: true,
            subCaste: true,
            manglikDosh: true,
            height: true,
            weight: true,
            bloodGroup: true,
            addressLine1: true,
            addressLine2: true,
            postOffice: true,
            policeStation: true,
            dist: true,
            state: true,
            pinCode: true,
            skinTone: true,
            bodyType: true,
            eatingHabits: true,
            smokingHabits: true,
            drinkingHabits: true,
            profession: true,
            education: true,
            hobbies: true,
            monthlyIncome: true,
            language: true,
            familyMembers: true,
            fatherProfession: true,
            candidatePreference: true,
            locationPreference: true,
            aboutMyself: true,
            aboutMyPartner: true,

            profileImages: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    // ✅ Format safely after null check
    const formattedUser: IFullUserWithImages = {
      id: user.id,
      title: user.title,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      type: user.type,
      blocked: user.blocked,
      isProfileComplete: user.isProfileComplete,
      avatar: user.avatar,
      createdAt: user.createdAt,
      gender: user.gender as UserGender,
      planExpiryDate: user.planExpiryDate || null,
      isGhotokOwned: user.isGhotokOwned,
      isProfilePublic: user.isProfilePublic,
      allowSocialPublish: user.allowSocialPublish,
      profile: user.profile,
      publicId: user.publicId || "",
      profileImages: user.profile?.profileImages || [],
    };

    return formattedUser;
  } catch (error) {
    console.error("Error fetching single user:", error);
    return null;
  }
}

export async function blockUserById(
  userId: string,
  status: boolean
): Promise<IServerResponse> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { blocked: status },
    });
    return {
      success: true,
      message: "User blocked successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error blocking user:", error);
    return {
      success: false,
      message: "Error blocking user.",
    } as IServerResponse;
  }
}

export async function getAllGroomsForChat(): Promise<IGroomForChat[]> {
  try {
    const [usersWithConversation, usersWithoutConversation] =
      await prisma.$transaction([
        prisma.user.findMany({
          where: {
            gender: "MALE",
            type: UserType.PAID,
            blocked: false,
            superAdminUserConversation: {
              isNot: null,
            },
          },
          select: {
            id: true,
            publicId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            avatar: true,
            isGhotokOwned: true,
            superAdminUserConversation: {
              select: {
                id: true,
                lastMessageAt: true,
                messages: {
                  select: {
                    id: true,
                    content: true,
                    senderId: true,
                    type: true,
                  },
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
              },
            },
          },
          orderBy: {
            superAdminUserConversation: {
              lastMessageAt: "desc",
            },
          },
        }),

        prisma.user.findMany({
          where: {
            gender: "MALE",
            type: UserType.PAID,
            blocked: false,
            superAdminUserConversation: null,
          },
          select: {
            id: true,
            publicId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            avatar: true,
            isGhotokOwned: true,
            superAdminUserConversation: {
              select: {
                id: true,
                lastMessageAt: true,
                messages: {
                  select: {
                    id: true,
                    content: true,
                    senderId: true,
                    type: true,
                  },
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        }),
      ]);

    const users = [...usersWithConversation, ...usersWithoutConversation];

    return users.map((user) => ({
      id: user.id,
      publicId: user.publicId,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      gender: user.gender,
      avatar: user.avatar,
      isGhotokOwned: user.isGhotokOwned,
      conversationId: user.superAdminUserConversation?.id ?? "",
      lastMessage: user.superAdminUserConversation?.messages?.[0] ?? null,
    }));
  } catch (error) {
    console.error("Error fetching grooms for chat:", error);
    return [];
  }
}

export async function getOrCreateUserSAConversationForSA(userId: string) {
  try {
    let conversation = await prisma.superAdminUserConversation.findFirst({
      where: {
        userId: userId,
      },
      select: {
        id: true,
      },
    });

    // 2) create if not found
    if (!conversation) {
      conversation = await prisma.superAdminUserConversation.create({
        data: {
          userId: userId,
        },
        select: {
          id: true,
        },
      });
    }

    return {
      success: true,
      conversationId: conversation.id,
      message: "Conversation fetched successfully.",
    };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return null;
  }
}
