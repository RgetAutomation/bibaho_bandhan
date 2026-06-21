import { Request, Response } from "express";
import { prisma } from "../config/db.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

// @desc    Create a new discount for a plan
// @route   POST /api/v1/discounts
// @access  Superadmin
export const createDiscount = async (req: Request, res: Response) => {
  const { planId, percentage } = req.body;

  if (!planId || percentage === undefined) {
    throw new ApiError(400, "Plan ID and Percentage are required");
  }

  // Ensure percentage is valid
  if (percentage <= 0 || percentage > 100) {
    throw new ApiError(400, "Percentage must be between 1 and 100");
  }

  // Deactivate any existing discounts for this plan before creating a new one
  await (prisma as any).discount.updateMany({
    where: { planId },
    data: { isActive: false },
  });

  const discount = await (prisma as any).discount.create({
    data: {
      planId,
      percentage,
      isActive: true,
    },
  });

  res.status(201).json(new ApiResponse(201, "Discount created successfully", discount));
};

// @desc    Get all discounts
// @route   GET /api/v1/discounts
// @access  Public / Superadmin
export const getAllDiscounts = async (req: Request, res: Response) => {
  const discounts = await (prisma as any).discount.findMany({
    include: {
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(new ApiResponse(200, "Discounts retrieved successfully", discounts));
};

// @desc    Toggle discount active status
// @route   PUT /api/v1/discounts/:id/toggle
// @access  Superadmin
export const toggleDiscountStatus = async (req: Request, res: Response) => {
  const { id } = req.params;

  const discount = await (prisma as any).discount.findUnique({
    where: { id },
  });

  if (!discount) {
    throw new ApiError(404, "Discount not found");
  }

  // If we are activating this discount, deactivate all other discounts for this plan
  if (!discount.isActive) {
    await (prisma as any).discount.updateMany({
      where: { planId: discount.planId, id: { not: id } },
      data: { isActive: false },
    });
  }

  const updatedDiscount = await (prisma as any).discount.update({
    where: { id },
    data: { isActive: !discount.isActive },
  });

  res.status(200).json(new ApiResponse(200, "Discount status updated successfully", updatedDiscount));
};

// @desc    Delete a discount
// @route   DELETE /api/v1/discounts/:id
// @access  Superadmin
export const deleteDiscount = async (req: Request, res: Response) => {
  const { id } = req.params;

  const discount = await (prisma as any).discount.findUnique({
    where: { id },
  });

  if (!discount) {
    throw new ApiError(404, "Discount not found");
  }

  await (prisma as any).discount.delete({
    where: { id },
  });

  res.status(200).json(new ApiResponse(200, "Discount deleted successfully", null));
};
