import { Request, Response } from "express";
import { prisma } from "../config/db.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { createHelpSchema, feedbackSchema } from "../schema/otherSchema.js";
import { ZodError } from "zod";

export async function createFeedback(req: Request, res: Response) {
  try {
    const { rating, name, phone, email, message } =
      await feedbackSchema.parseAsync(req.body);
    await prisma.feedback.create({
      data: {
        name,
        rating,
        phone,
        email,
        feedback: message,
      },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "Feedback created successfully", null));
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function createHelpRequest(req: Request, res: Response) {
  try {
    const { name, phone, email, reason, message } =
      await createHelpSchema.parseAsync(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, ...(email ? [{ email }] : [])],
      },
    });

    if (existingUser) {
      return res.status(400).json(new ApiError(400, "USER_ALREADY_EXISTS"));
    }

    // Block duplicate: check for any active (non-RESOLVED, non-CLOSED) request with same phone or email
    const activeRequest = await prisma.helpRequest.findFirst({
      where: {
        status: { notIn: ["RESOLVED", "CLOSED"] },
        OR: [
          { phone },
          ...(email ? [{ email }] : []),
        ],
      },
      select: { id: true },
    });

    if (activeRequest) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "ACTIVE_REQUEST_EXISTS",
        data: activeRequest.id,
      });
    }

    const request = await prisma.helpRequest.create({
      data: {
        name,
        phone,
        email,
        reason,
        message,
      },
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Help request created successfully", request.id)
      );
  } catch (err) {
    console.error(err);
    if (err instanceof ZodError) {
      return res.status(400).json(new ApiError(400, err.errors[0]?.message || "Validation Error"));
    }
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function helpRequestSearch(req: Request, res: Response) {
  try {
    // Get data from user
    const { phone, email } = req.body;

    const request = await prisma.helpRequest.findFirst({
      where: {
        OR: [
          ...(phone ? [{ phone }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
      select: {
        id: true,
      },
    });

    // User already exists
    if (!request) {
      return res.status(400).json(new ApiError(400, "No request found"));
    }

    // Send response
    return res
      .status(200)
      .json(new ApiResponse(200, "Request found", request.id));
  } catch (error) {
    console.log(error);
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json(new ApiError(400, error.errors[0]?.message as string));
    }
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getHelpRequestById(req: Request, res: Response) {
  try {
    // Get data from user
    const requestId = req.params.requestId;

    // Check if request id is valid
    if (!requestId) {
      return res.status(400).json(new ApiError(400, "Invalid request id"));
    }

    const requestedUser = await prisma.helpRequest.findFirst({
      where: { id: requestId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        reason: true,
        message: true,
        adminNote: true,
        feedback: true,
        resolvedAt: true,
        isReopened: true,
        createdAt: true,
      },
    });

    // Send response
    return res
      .status(201)
      .json(
        new ApiResponse(200, "Help request found successfully", requestedUser)
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function updateHelpRequestFeedback(req: Request, res: Response) {
  try {
    // Get data from user
    const { requestId, feedback } = req.body;

    // Check if request id is valid
    if (!requestId) {
      return res.status(400).json(new ApiError(400, "Invalid request id"));
    }

    if (!feedback) {
      return res.status(400).json(new ApiError(400, "Feedback is required"));
    }

    const requestedUser = await prisma.helpRequest.update({
      where: { id: requestId },
      data: {
        feedback,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        reason: true,
        message: true,
        adminNote: true,
        feedback: true,
        createdAt: true,
      },
    });

    // Send response
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Feedback updated successfully", requestedUser)
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getHelpRequestMessages(req: Request, res: Response) {
  try {
    const requestId = req.params.requestId;
    if (!requestId) {
      return res.status(400).json(new ApiError(400, "Invalid request id"));
    }

    const messages = await prisma.helpRequestMessage.findMany({
      where: { helpRequestId: requestId },
      orderBy: { createdAt: "asc" },
      include: {
        teamSender: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
            internalId: true,
            role: true,
          },
        },
      },
    });

    return res.status(200).json(new ApiResponse(200, "Messages fetched", messages));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function sendGuestHelpMessage(req: Request, res: Response) {
  try {
    const requestId = req.params.requestId;
    const { content } = req.body;

    if (!requestId) {
      return res.status(400).json(new ApiError(400, "Invalid request id"));
    }
    if (!content) {
      return res.status(400).json(new ApiError(400, "Message content is required"));
    }

    const ticket = await prisma.helpRequest.findUnique({ where: { id: requestId } });
    if (!ticket) {
      return res.status(404).json(new ApiError(404, "Ticket not found"));
    }

    const message = await prisma.helpRequestMessage.create({
      data: {
        helpRequestId: requestId,
        senderType: "GUEST",
        content,
      },
    });

    await prisma.helpRequest.update({
      where: { id: requestId },
      data: { updatedAt: new Date() },
    });

    return res.status(201).json(new ApiResponse(201, "Message sent successfully", message));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

// Guest reopens a RESOLVED ticket (within 7-day window)
export async function reopenHelpRequest(req: Request, res: Response) {
  try {
    const { requestId } = req.params;

    if (!requestId) {
      return res.status(400).json(new ApiError(400, "Invalid request id"));
    }

    const ticket = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      select: { id: true, status: true, resolvedAt: true },
    });

    if (!ticket) {
      return res.status(404).json(new ApiError(404, "Ticket not found"));
    }

    if (ticket.status !== "RESOLVED") {
      return res.status(400).json(new ApiError(400, "This ticket is not in RESOLVED state"));
    }

    // Check 7-day window
    if (ticket.resolvedAt) {
      const daysSinceResolved =
        (Date.now() - new Date(ticket.resolvedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceResolved > 7) {
        return res.status(400).json(new ApiError(400, "The 7-day reopen window has passed. This ticket is now permanently closed."));
      }
    }

    const updated = await prisma.helpRequest.update({
      where: { id: requestId },
      data: {
        status: "INPROGRESS",
        resolvedAt: null,
        isReopened: true, // mark as user-reopened
      },
    });

    return res.status(200).json(new ApiResponse(200, "Ticket reopened successfully", updated));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

// Cron job: Auto-close RESOLVED tickets older than 7 days & delete their messages
export async function autoCloseResolvedTickets() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Find all RESOLVED tickets whose resolvedAt is older than 7 days
    const expiredTickets = await prisma.helpRequest.findMany({
      where: {
        status: "RESOLVED",
        resolvedAt: { lte: sevenDaysAgo },
      },
      select: { id: true },
    });

    if (expiredTickets.length === 0) {
      console.log("[CRON] No expired resolved tickets found.");
      return;
    }

    const ticketIds = expiredTickets.map((t) => t.id);

    // Delete all messages for these tickets (messages have Cascade delete,
    // but we do it explicitly to keep logs clean)
    await prisma.helpRequestMessage.deleteMany({
      where: { helpRequestId: { in: ticketIds } },
    });

    // Mark tickets as CLOSED
    const result = await prisma.helpRequest.updateMany({
      where: { id: { in: ticketIds } },
      data: { status: "CLOSED" },
    });

    console.log(`[CRON] Auto-closed ${result.count} resolved tickets and cleared their messages.`);
  } catch (error) {
    console.error("[CRON] autoCloseResolvedTickets failed:", error);
  }
}
