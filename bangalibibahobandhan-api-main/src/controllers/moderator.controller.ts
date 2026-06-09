import { Request, Response } from "express";
import { prisma } from "../config/db.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Role } from "../types/roles.js";
import { Gender } from "../types/gender.js";
import { addIdPrefix } from "../utils/formatTeamID.js";
import { redisService } from "../services/RedisService.js";

export async function moderatorDashboard(req: Request, res: Response) {
  const currentUserId = req.systemUser?.id;
  try {
    // Get data from database
    const [
      approvalConversations,
      assignedWork,
      starredConversation,
      matchingConversation,
      reportedUser,
    ] = await prisma.$transaction([
      prisma.message.count({
        where: {
          moderation: {
            moderatorId: currentUserId,
            status: "PENDING",
          },
        },
      }),
      prisma.conversation.count({
        where: {
          hasGhotokParticipant: true,
          assignedModeratorId: currentUserId,
        },
      }),
      prisma.conversation.count({
        where: {
          hasGhotokParticipant: true,
          assignedModeratorId: currentUserId,
          starConversation: true,
        },
      }),
      prisma.matchingReport.count(),
      prisma.reportUsers.count({
        where: {
          userType: "USER",
          reportedAgainst: {
            gender: Gender.FEMALE,
          },
        },
      }),
    ]);
    const formattedData = {
      approvedConversations: approvalConversations,
      assignedWork: assignedWork,
      starredConversation: starredConversation,
      matchingConversation: matchingConversation,
      reportHistory: reportedUser,
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

export async function getAllModerationMessages(req: Request, res: Response) {
  try {
    const userId = req.systemUser?.id;
    // Get data from database
    const moderationMessages = await prisma.message.findMany({
      where: {
        moderation: {
          moderatorId: userId,
          status: "PENDING",
        },
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            title: true,
            lastName: true,
            gender: true,
            isGhotokOwned: true,
          },
        },
        receiver: {
          select: {
            id: true,
            title: true,
            lastName: true,
            gender: true,
            isGhotokOwned: true,
          },
        },
        conversation: {
          select: {
            id: true,
            convId: true,
            starConversation: true,
          },
        },
      },
      take: 10,
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Moderation messages fetched successfully",
          moderationMessages
        )
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function starMarkConversation(req: Request, res: Response) {
  try {
    const userId = req.systemUser?.id;
    const { convId, star } = req.body;

    if (!convId) {
      return res
        .status(400)
        .json(new ApiError(400, "Conversation ID is required"));
    }

    // Get data from database
    const conversation = await prisma.conversation.updateMany({
      where: {
        id: convId,
        assignedModeratorId: userId,
      },
      data: {
        starConversation: star,
      },
    });

    if (!conversation) {
      return res.status(404).json(new ApiError(404, "Conversation not found"));
    }

    const responseMessage = star
      ? "Conversation starred!"
      : "Conversation unstarred!";

    res.status(200).json(new ApiResponse(200, responseMessage, null));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function createReportBrideByModerator(
  req: Request,
  res: Response
) {
  try {
    const currentModeratorId = req.systemUser?.id as string;
    const { userId, reason } = req.body;
    // Get data from database
    const reportGroom = await prisma.reportUserTeams.create({
      data: {
        reason: reason,
        reportedId: currentModeratorId,
        userId: userId,
      },
      select: {
        id: true,
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, "Bride reported successfully", reportGroom.id)
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function reportedBridesByModerator(req: Request, res: Response) {
  try {
    const userId = req.systemUser?.id;
    // Get data from database
    const reportedBrides = await prisma.reportUserTeams.findMany({
      where: {
        reportedId: userId,
        user: {
          gender: "FEMALE",
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
          "Reported brides fetched successfully",
          reportedBrides
        )
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getSingleReportedBrideByModerator(
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
          gender: "FEMALE",
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
            avatar: true,
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
          "Reported bride fetched successfully",
          reportedGroom
        )
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getAllAdmins(req: Request, res: Response) {
  try {
    const userId = req.systemUser?.id;
    const responese = await prisma.team.findMany({
      where: {
        role: "ADMIN",
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
                id: userId,
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
      conversationId: team.adminModeratorConversations[0]?.id,
    }));

    res
      .status(200)
      .json(new ApiResponse(200, "Admins fetched successfully", formattedData));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getAllAssignedWork(req: Request, res: Response) {
  try {
    const userId = req.systemUser?.id;
    const responese = await prisma.conversation.findMany({
      where: {
        assignedModeratorId: userId,
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
      orderBy: {
        createdAt: "desc",
      },
    });
    res
      .status(200)
      .json(new ApiResponse(200, "Moderators fetched successfully", responese));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getAllStarredConversation(req: Request, res: Response) {
  try {
    const userId = req.systemUser?.id;
    const responese = await prisma.conversation.findMany({
      where: {
        assignedModeratorId: userId,
        starConversation: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });
    res
      .status(200)
      .json(new ApiResponse(200, "Moderators fetched successfully", responese));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function createMatchingConversationsForModerator(
  req: Request,
  res: Response
) {
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

export async function deleteMatchingConversationsForModerator(
  req: Request,
  res: Response
) {
  try {
    const teamId = req.systemUser?.id;
    const { reportId } = req.params;

    if (!reportId) {
      return res.status(400).json(new ApiError(400, "Missing required fields"));
    }

    const result = await prisma.matchingReport.deleteMany({
      where: {
        id: reportId,
        teamId,
        NOT: {
          status: "APPROVED",
        },
      },
    });

    if (result.count === 0) {
      return res
        .status(404)
        .json(new ApiError(404, "Matching report not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Match removed successfully", reportId));
  } catch (error) {
    console.log(error);
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getTotalMatchingConversationsForModerator(
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
          teamId: req.systemUser?.id,
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

export async function getAllRejectedMessages(req: Request, res: Response) {
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
      prisma.message.findMany({
        where: {
          moderation: {
            moderatorId: req.systemUser?.id,
            status: "REJECTED",
          },
        },
        select: {
          id: true,
          content: true,
          conversation: {
            select: {
              id: true,
              convId: true,
            },
          },
          moderation: {
            select: {
              reason: true,
              updatedAt: true,
            },
          },
          createdAt: true,
        },

        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
      }),
      prisma.message.count({
        where: {
          moderation: {
            moderatorId: req.systemUser?.id,
            status: "REJECTED",
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalData / limitNum);

    // post-process: remove avatar for non-MALE
    const processedConversations = matchingConversation.map((c) => ({
      id: c.id,
      conversationId: c.conversation.id,
      convId: c.conversation.convId,
      content: c.content,
      reason: c.moderation?.reason,
      createdAt: c.createdAt,
      updatedAt: c.moderation?.updatedAt,
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

export async function getAllRejectedTemplates(req: Request, res: Response) {
  try {
    const cached = await redisService.getAllTemplatesFromRedis();
    if (cached && cached.length) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Rejected templates fetched successfully",
            cached
          )
        );
    } else {
      const rejectedTemplates = await prisma.messageTemplate.findMany({
        where: {
          category: "MODERATOR_MODERATION",
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          content: true,
        },
      });

      for (const template of rejectedTemplates) {
        await redisService.setTemplate(
          template.id,
          template.name,
          template.content
        );
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Rejected templates fetched successfully",
            rejectedTemplates
          )
        );
    }
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}
