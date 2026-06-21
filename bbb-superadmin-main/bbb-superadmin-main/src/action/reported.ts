"use server";

import {
  IReportedTeam,
  IReportedUsers,
} from "@/components/interface/IReportedUser";
import { IServerResponse } from "@/components/interface/IServerResponse";
import { prisma } from "@/lib/prisma";

export async function getAllReportedUsers(): Promise<IReportedUsers[]> {
  try {
    const reportedUser = await prisma.reportUsers.findMany({
      select: {
        id: true,
        screenShotUrl: true,
        reason: true,
        reply: true,
        userType: true,
        createdAt: true,
        status: true,
        reportedAgainst: {
          select: {
            id: true,
            title: true,
            firstName: true,
            middleName: true,
            lastName: true,
            phone: true,
            gender: true,
            avatar: true,
            blocked: true,
          },
        },
        reporter: {
          select: {
            id: true,
            title: true,
            firstName: true,
            middleName: true,
            lastName: true,
            phone: true,
            gender: true,
            avatar: true,
            blocked: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return reportedUser;
  } catch (error) {
    console.error("Error fetching reported users:", error);
    return [];
  }
}

export async function getAllTeamReportedUsers(): Promise<IReportedTeam[]> {
  try {
    const reportedUser = await prisma.reportUserTeams.findMany({
      select: {
        id: true,
        reason: true,
        reply: true,
        createdAt: true,
        status: true,
        user: {
          select: {
            id: true,
            title: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            phone: true,
            avatar: true,
            blocked: true,
          },
        },
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
      },
      orderBy: { createdAt: "desc" },
    });
    return reportedUser;
  } catch (error) {
    console.error("Error fetching reported users:", error);
    return [];
  }
}

export async function getReportedUserById(
  id: string
): Promise<IReportedUsers | null> {
  try {
    const reportedUser = await prisma.reportUsers.findUnique({
      where: { id },
      select: {
        id: true,
        screenShotUrl: true,
        reason: true,
        reply: true,
        userType: true,
        createdAt: true,
        status: true,
        reportedAgainst: {
          select: {
            id: true,
            title: true,
            firstName: true,
            middleName: true,
            lastName: true,
            phone: true,
            avatar: true,
            gender: true,
            blocked: true,
          },
        },
        reporter: {
          select: {
            id: true,
            title: true,
            firstName: true,
            middleName: true,
            lastName: true,
            phone: true,
            gender: true,
            avatar: true,
            blocked: true,
          },
        },
      },
    });
    return reportedUser;
  } catch (error) {
    console.error("Error fetching reported user:", error);
    return null;
  }
}

export async function getReportedTeamById(
  id: string
): Promise<IReportedTeam | null> {
  try {
    const reportedUser = await prisma.reportUserTeams.findUnique({
      where: { id },
      select: {
        id: true,
        screenShotUrl: true,
        reason: true,
        reply: true,
        userType: true,
        createdAt: true,
        status: true,
        user: {
          select: {
            id: true,
            title: true,
            firstName: true,
            middleName: true,
            lastName: true,
            phone: true,
            avatar: true,
            gender: true,
            blocked: true,
          },
        },
        team: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            phone: true,
            gender: true,
            avatar: true,
            blocked: true,
          },
        },
      },
    });
    return reportedUser;
  } catch (error) {
    console.error("Error fetching reported user:", error);
    return null;
  }
}

export async function reportReply(
  userId: string,
  reply: string
): Promise<IServerResponse> {
  try {
    await prisma.reportUsers.update({
      where: { id: userId },
      data: { reply, status: "RESOLVED" },
    });
    return { success: true, message: "Reply saved successfully." };
  } catch (error) {
    console.error("Error sending reply:", error);
    return { success: false, message: "Failed to save reply." };
  }
}

export async function reportTeamReply(
  userId: string,
  reply: string
): Promise<IServerResponse> {
  try {
    await prisma.reportUserTeams.update({
      where: { id: userId },
      data: { reply, status: "RESOLVED" },
    });
    return { success: true, message: "Reply saved successfully." };
  } catch (error) {
    console.error("Error sending reply:", error);
    return { success: false, message: "Failed to save reply." };
  }
}
