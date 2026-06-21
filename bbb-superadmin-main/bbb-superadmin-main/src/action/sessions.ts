"use server";

import { ISession } from "@/components/interface/ISession";
import { prisma } from "@/lib/prisma";

export async function getAllLoggedInSessions(): Promise<ISession[]> {
  try {
    const sessions = await prisma.teamSession.findMany({
      where: {
        team: {
          NOT: {
            role: "SUPERADMIN",
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
        team: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    return sessions;
    return sessions;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
}

export async function getSuperAdminSessions(superAdminId: string): Promise<ISession[]> {
  try {
    const sessions = await prisma.teamSession.findMany({
      where: {
        userId: superAdminId,
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
        team: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    return sessions;
  } catch (error) {
    console.error("Error fetching superadmin sessions:", error);
    return [];
  }
}

export async function revokeSession(id: string): Promise<boolean> {
  try {
    await prisma.teamSession.deleteMany({
      where: {
        id: id,
      },
    });
    return true;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return false;
  }
}
