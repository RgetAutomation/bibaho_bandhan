import { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { Gender } from "../types/gender.js";
import { UserType } from "../types/user-type.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { PaymentStatus, Prisma } from "@prisma/client";
import { addIdPrefix } from "../utils/formatTeamID.js";
import { Role } from "../types/roles.js";

export async function adminDashboard(req: Request, res: Response) {
  try {
    // Get data from database
    const [
      conversaion,
      matchingRoom,
      paymentReceived,
      freeGroom,
      paidGroom,
      endPlanGroom,
      blockedGroom,
      reportedUser,
      helpRequests,
    ] = await prisma.$transaction([
      prisma.conversation.count({
        where: {
          hasGhotokParticipant: true,
          assignedModeratorId: null,
        },
      }),
      prisma.matchingReport.count(),
      prisma.payment.count({
        where: {
          status: PaymentStatus.PENDING,
          paymentType: "SUBSCRIPTION",
        },
      }),
      prisma.user.count({
        where: {
          gender: Gender.MALE,
          type: UserType.FREE_USER,
        },
      }),
      prisma.user.count({
        where: {
          gender: Gender.MALE,
          type: UserType.PAID_USER,
        },
      }),
      prisma.user.count({
        where: {
          gender: Gender.MALE,
          type: UserType.PAID_USER,
          planExpiryDate: {
            lte: new Date(),
          },
        },
      }),
      prisma.user.count({
        where: {
          gender: Gender.MALE,
          blocked: true,
        },
      }),
      prisma.reportUsers.count({
        where: {
          userType: "USER",
          reportedAgainst: {
            gender: "MALE",
          },
        },
      }),
      prisma.helpRequest.count(),
    ]);
    const formattedData = {
      conversations: conversaion,
      matchingRoom: matchingRoom,
      paymentReceived: paymentReceived,
      freeGrooms: freeGroom,
      paidGrooms: paidGroom,
      endPlanGrooms: endPlanGroom,
      blockedGrooms: blockedGroom,
      reportedGrooms: reportedUser,
      helpRequests: helpRequests,
    };

    res
      .status(200)
      .json(
        new ApiResponse(200, "Free groom fetched successfully", formattedData)
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function freeGroom(req: Request, res: Response) {
  try {
    // Get data from database
    const freeGroom = await prisma.user.findMany({
      where: {
        gender: Gender.MALE,
        type: UserType.FREE_USER,
        blocked: false,
      },
      select: {
        id: true,
        publicId: true,
        title: true,
        lastName: true,
        gender: true,
        type: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res
      .status(200)
      .json(new ApiResponse(200, "Free groom fetched successfully", freeGroom));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function paidGroom(req: Request, res: Response) {
  try {
    // Get data from database
    const paidGroom = await prisma.user.findMany({
      where: {
        gender: Gender.MALE,
        type: UserType.PAID_USER,
        planExpiryDate: { gte: new Date() },
        isGhotokOwned: false,
      },
      select: {
        id: true,
        publicId: true,
        title: true,
        lastName: true,
        gender: true,
        type: true,
        planExpiryDate: true,
      },
      orderBy: {
        planExpiryDate: "asc",
      },
    });

    const formattedData = paidGroom.map((paid) => ({
      id: paid.id,
      publicId: paid.publicId,
      title: paid.title,
      lastName: paid.lastName,
      gender: paid.gender,
      type: paid.type,
      planExpiryDate: paid.planExpiryDate,
    }));

    res
      .status(200)
      .json(
        new ApiResponse(200, "Paid groom fetched successfully", formattedData)
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function blockedGroom(req: Request, res: Response) {
  try {
    // Get data from database
    const blockedGroom = await prisma.user.findMany({
      where: {
        gender: Gender.MALE,
        blocked: true,
        isGhotokOwned: false,
      },
      select: {
        id: true,
        publicId: true,
        title: true,
        lastName: true,
        gender: true,
        type: true,
        planExpiryDate: true,
        createdAt: true,
      },
      orderBy: {
        planExpiryDate: "desc",
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, "Blocked groom fetched successfully", blockedGroom)
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function endPlanGroom(req: Request, res: Response) {
  try {
    // Get data from database
    const endPlanGroom = await prisma.user.findMany({
      where: {
        gender: Gender.MALE,
        type: UserType.PAID_USER,
        planExpiryDate: {
          lte: new Date(),
        },
      },
      select: {
        id: true,
        publicId: true,
        title: true,
        lastName: true,
        gender: true,
        type: true,
        planExpiryDate: true,
        createdAt: true,
      },
      orderBy: {
        planExpiryDate: "desc",
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "End plan groom fetched successfully",
          endPlanGroom
        )
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function paidMatching(req: Request, res: Response) {
  try {
    // Get data from database
    const paidMatching = await prisma.user.findMany({
      where: {
        gender: Gender.MALE,
        hasMatched: true,
      },
      select: {
        id: true,
        title: true,
        lastName: true,
        gender: true,
        type: true,
        matchingStartDate: true,
        matchingExpiryDate: true,
        createdAt: true,
      },
      orderBy: {
        matchingExpiryDate: "desc",
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, "Paid matching fetched successfully", paidMatching)
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function createReportGroomByAdmin(req: Request, res: Response) {
  try {
    const currentAdminId = req.systemUser?.id as string;
    const { userId, reason } = req.body;
    // Get data from database
    const reportGroom = await prisma.reportUserTeams.create({
      data: {
        reason: reason,
        reportedId: currentAdminId,
        userId: userId,
      },
      select: {
        id: true,
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, "Groom reported successfully", reportGroom.id)
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function reportedGroomByAdmin(req: Request, res: Response) {
  try {
    const userId = req.systemUser?.id;
    // Get data from database
    const reportedGroom = await prisma.reportUserTeams.findMany({
      where: {
        reportedId: userId,
        user: {
          gender: "MALE",
        },
      },
      select: {
        id: true,
        reason: true,
        status: true,
        user: {
          select: {
            id: true,
            publicId: true,
            title: true,
            lastName: true,
            gender: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Reported groom fetched successfully",
          reportedGroom
        )
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getSingleReportedGroomByAdmin(
  req: Request,
  res: Response
) {
  try {
    const currentAdminId = req.systemUser?.id;
    const { reportedId } = req.params;

    if (!reportedId) {
      return res.status(400).json(new ApiError(400, "Reported Id not found"));
    }

    // Get data from database
    const reportedGroom = await prisma.reportUserTeams.findFirst({
      where: {
        id: reportedId,
        reportedId: currentAdminId,
        user: {
          gender: "MALE",
        },
      },
      select: {
        id: true,
        reason: true,
        reply: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            publicId: true,
            title: true,
            lastName: true,
            gender: true,
            type: true,
            planExpiryDate: true,
          },
        },
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Reported groom fetched successfully",
          reportedGroom
        )
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

function buildSortWhere(sortBy?: string): Prisma.PaymentWhereInput {
  switch (sortBy) {
    case "pending":
      return {
        status: "PENDING",
      };

    case "approved":
      return {
        status: "APPROVED",
      };

    case "rejected":
      return {
        status: "REJECTED",
      };
    default:
      return {};
  }
}

export async function getAllPayments(req: Request, res: Response) {
  try {
    const adminId = req.systemUser?.id as string;

    let { page = "1", limit = "10", sortBy = "all" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json(new ApiError(400, "Invalid page number"));
    }
    if (isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json(new ApiError(400, "Invalid limit number"));
    }

    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.PaymentWhereInput = {
      paymentType: "SUBSCRIPTION",
      teamId: adminId,
      ...buildSortWhere(sortBy as string),
    };

    const [payments, totalData] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        select: {
          id: true,
          status: true,
          createdAt: true,
          plan: {
            select: {
              price: true,
            },
          },
          user: {
            select: {
              id: true,
              publicId: true,
              title: true,
              lastName: true,
              gender: true,
              type: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.payment.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalData / limitNum);

    res.status(200).json(
      new ApiResponse(200, "All payments fetched successfully", {
        totalData,
        totalPages,
        currentPage: pageNum,
        pageSize: limitNum,
        data: payments,
      })
    );
  } catch (error) {
    console.log(error);
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getPaymentDetailsById(req: Request, res: Response) {
  try {
    const paymentId = req.params.paymentId;
    if (!paymentId) {
      return res.status(400).json(new ApiError(400, "Payment id is required"));
    }

    const responese = await prisma.payment.findFirst({
      where: {
        id: paymentId,
      },
      select: {
        id: true,
        status: true,
        screenShotUrl: true,
        createdAt: true,
        paymentName: true,
        feedback: true,
        user: {
          select: {
            id: true,
            title: true,
            lastName: true,
            type: true,
            gender: true,
          },
        },
        plan: {
          select: {
            id: true,
            title: true,
            price: true,
            duration: true,
            connection: true,
          },
        },
      },
    });
    res
      .status(200)
      .json(new ApiResponse(200, "Payments fetched successfully", responese));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getAllModerators(req: Request, res: Response) {
  try {
    const responese = await prisma.team.findMany({
      where: {
        role: "MODERATOR",
        blocked: false,
        isProfileComplete: true,
      },
      select: {
        id: true,
        internalId: true,
        gender: true,
        role: true,
        adminModeratorConversations: {
          where: {
            participants: {
              some: {
                id: req.user?.id,
              },
            },
          },
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });

    const formattedData = responese.map((team) => ({
      id: team.id,
      internalId: addIdPrefix(team.internalId.toString(), team.role as Role),
      gender: team.gender,
      role: team.role,
      conversationId: team.adminModeratorConversations[0]?.id,
    }));

    res
      .status(200)
      .json(new ApiResponse(200, "Team fetched successfully", formattedData));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getAllGroomConversations(req: Request, res: Response) {
  try {
    let { page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json(new ApiError(400, "Invalid page number"));
    }
    if (isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json(new ApiError(400, "Invalid limit number"));
    }

    const skip = (pageNum - 1) * limitNum;

    const [conversation, totalData] = await prisma.$transaction([
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
              lastName: true,
              gender: true,
            },
          },
        },

        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
      }),
      prisma.conversation.count({
        where: {
          hasGhotokParticipant: true,
          assignedModeratorId: null,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalData / limitNum);

    // post-process: remove avatar for non-MALE
    const processedConversations = conversation.map((c) => ({
      ...c,
      participants: c.participants.map((p) => ({
        ...p,
      })),
    }));

    res.status(200).json(
      new ApiResponse(200, "Team fetched successfully", {
        totalData,
        totalPages,
        currentPage: pageNum,
        pageSize: limitNum,
        data: processedConversations,
      })
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function assignConversationToModerator(
  req: Request,
  res: Response
) {
  try {
    const userId = req.systemUser?.id;
    const { conversationIds, moderatorId } = req.body as {
      conversationIds: string[];
      moderatorId: string;
    };

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!conversationIds || conversationIds.length === 0) {
      return res.status(400).json({ message: "No conversation IDs provided" });
    }
    if (!moderatorId) {
      return res.status(400).json({ message: "Moderator ID is required" });
    }

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

    return res
      .status(200)
      .json(new ApiResponse(200, "Conversations assigned successfully", null));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getTotalAssignedConversationsLog(
  req: Request,
  res: Response
) {
  try {
    const userId = req.systemUser?.id;

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    let { page = "1", limit = "10", days = "7" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const daysNum = parseInt(days as string, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json(new ApiError(400, "Invalid page number"));
    }
    if (isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json(new ApiError(400, "Invalid limit number"));
    }

    if (isNaN(daysNum) || daysNum < 1) {
      return res.status(400).json(new ApiError(400, "Invalid days number"));
    }

    const today = new Date();
    const startDate = new Date(today.getTime() - daysNum * 24 * 60 * 60 * 1000);

    const skip = (pageNum - 1) * limitNum;

    const [conversationAssignedAuditLogs, totalData] =
      await prisma.$transaction([
        prisma.convsersationAssignedAuditLogs.findMany({
          where: {
            createdAt: { gte: startDate },
            adminId: userId,
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
                    lastName: true,
                    gender: true,
                  },
                },
              },
            },
            moderator: {
              select: {
                id: true,
                internalId: true,
                gender: true,
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

    // post-process: remove avatar for non-MALE
    const processedConversations = conversationAssignedAuditLogs.map((c) => ({
      id: c.id,
      createdAt: c.createdAt,
      moderator: {
        ...c.moderator,
        internalId: addIdPrefix(
          c.moderator.internalId.toString(),
          Role.MODERATOR
        ),
      },
      conversationId: c.conversation.id,
      convId: c.conversation.convId,
      participants: c.conversation.participants.map((p) => ({
        ...p,
      })),
    }));

    res.status(200).json(
      new ApiResponse(200, "Audit logs fetched successfully", {
        totalData,
        totalPages,
        currentPage: pageNum,
        pageSize: limitNum,
        data: processedConversations,
      })
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getTotalMatchingConversations(
  req: Request,
  res: Response
) {
  try {
    let { page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json(new ApiError(400, "Invalid page number"));
    }
    if (isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json(new ApiError(400, "Invalid limit number"));
    }
    const skip = (pageNum - 1) * limitNum;

    const [matchingConversation, totalData] = await prisma.$transaction([
      prisma.matchingReport.findMany({
        where: {
          NOT: { status: "APPROVED" },
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
                  lastName: true,
                  gender: true,
                },
              },
            },
          },
          moderator: {
            select: {
              id: true,
              internalId: true,
              gender: true,
              role: true,
            },
          },
          status: true,
          message: true,
          createdAt: true,
        },

        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
      }),
      prisma.matchingReport.count(),
    ]);

    const totalPages = Math.ceil(totalData / limitNum);

    // post-process: remove avatar for non-MALE
    const processedConversations = matchingConversation.map((c) => ({
      id: c.id,
      status: c.status,
      message: c.message,
      createdAt: c.createdAt,
      moderator: {
        ...c.moderator,
        internalId: addIdPrefix(
          c.moderator.internalId.toString(),
          c.moderator.role as Role
        ),
      },
      conversationId: c.conversation.id,
      convId: c.conversation.convId,
      participants: c.conversation.participants,
    }));

    res.status(200).json(
      new ApiResponse(200, "Matching conversations fetched successfully", {
        totalData,
        totalPages,
        currentPage: pageNum,
        pageSize: limitNum,
        data: processedConversations,
      })
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function createMatchingConversations(req: Request, res: Response) {
  try {
    const teamId = req.systemUser?.id;
    const { message, conversationId } = req.body;

    if (!teamId || !conversationId) {
      return res.status(400).json(new ApiError(400, "Missing required fields"));
    }

    const matchingReport = await prisma.matchingReport.create({
      data: {
        message,
        conversationId,
        teamId,
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Conversation marked as matched",
          matchingReport.id
        )
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}
