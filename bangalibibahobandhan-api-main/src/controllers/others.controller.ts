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
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function helpRequestSearch(req: Request, res: Response) {
  try {
    // Get data from user
    const { requestId, phone } = req.body;

    const request = await prisma.helpRequest.findFirst({
      where: {
        OR: [{ id: requestId }, { phone: phone }],
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
