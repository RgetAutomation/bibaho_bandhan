import { Request, Response } from "express";
import { prisma } from "../config/db.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { planSchema } from "../schema/superadminSchema.js";
import { ZodError } from "zod";

export async function createPlan(req: Request, res: Response) {
  try {
    // Get data from request body
    const { title, price, duration, connection } = await planSchema.parseAsync(
      req.body
    );

    // Create plan
    const plan = await prisma.plan.create({
      data: {
        title,
        price,
        duration,
        connection,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(200, "Plan created successfully", plan));
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json(new ApiError(400, error.errors[0]?.message as string));
    } else {
      return res.status(500).json(new ApiError(500, "Internal server error"));
    }
  }
}

export async function getPlansForSA(req: Request, res: Response) {
  try {
    // Get plans from database
    const plans = await prisma.plan.findMany();
    return res
      .status(200)
      .json(new ApiResponse(200, "Plans fetched successfully", plans));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}
