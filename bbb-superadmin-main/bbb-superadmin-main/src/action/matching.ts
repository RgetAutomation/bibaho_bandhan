"use server";

import { IMatchingRoom } from "@/components/interface/IMatchingRoom";
import { IServerResponse } from "@/components/interface/IServerResponse";
import { prisma } from "@/lib/prisma";

export async function getMatchingRoom(): Promise<IMatchingRoom[]> {
  try {
    const matchingReports = await prisma.matchingReport.findMany({
      select: {
        id: true,
        status: true,
        message: true,
        createdAt: true,
        moderator: {
          select: {
            id: true,
            internalId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            avatar: true,
          },
        },
        conversation: {
          select: {
            id: true,
            participants: {
              select: {
                id: true,
                publicId: true,
                firstName: true,
                middleName: true,
                lastName: true,
                gender: true,
                avatar: true,
                isGhotokOwned: true,
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
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return matchingReports;
  } catch (error) {
    console.error("Error fetching matching reports:", error);
    return [];
  }
}

export async function getMatchingReportById(
  id: string
): Promise<IMatchingRoom | null> {
  try {
    const matchingReports = await prisma.matchingReport.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        status: true,
        message: true,
        createdAt: true,
        moderator: {
          select: {
            id: true,
            internalId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            avatar: true,
          },
        },
        conversation: {
          select: {
            id: true,
            participants: {
              select: {
                id: true,
                publicId: true,
                firstName: true,
                middleName: true,
                lastName: true,
                gender: true,
                avatar: true,
                isGhotokOwned: true,
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
        },
      },
    });
    return matchingReports;
  } catch (error) {
    console.error("Error fetching matching reports:", error);
    return null;
  }
}

export async function rejectMatchingReportById(
  id: string
): Promise<IServerResponse> {
  try {
    await prisma.matchingReport.update({
      where: {
        id: id,
      },
      data: {
        status: "REJECTED",
      },
    });
    return {
      success: true,
      message: "Matching report rejected",
    } as IServerResponse;
  } catch (error) {
    console.error("Error fetching matching reports:", error);
    return {
      success: false,
      message: "Failed to reject matching report",
    };
  }
}

// export async function updateMatchingStatus(id: string, status: PaymentStatus) {
//   try {
//     await prisma.matchingReport.update({
//       where: {
//         id: id,
//       },
//       data: {
//         status: status,
//       },
//     });

//     return {
//       success: true,
//       message: "Matching report updated",
//     } as IServerResponse;
//   } catch (error) {
//     console.log(error);
//     return {
//       success: false,
//       message: "Failed to update matching report",
//     } as IServerResponse;
//   }
// }
