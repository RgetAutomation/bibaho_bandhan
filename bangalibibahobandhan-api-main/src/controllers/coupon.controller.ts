import { Request, Response } from "express";
import { prisma } from "../config/db.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

// @desc    Create a new coupon for a plan
// @route   POST /api/v1/coupons
// @access  Superadmin
export const createCoupon = async (req: Request, res: Response) => {
  const { code, planId, percentage } = req.body;

  if (!code || !planId || percentage === undefined) {
    throw new ApiError(400, "Code, Plan ID, and Percentage are required");
  }

  // Ensure percentage is valid
  if (percentage <= 0 || percentage > 100) {
    throw new ApiError(400, "Percentage must be between 1 and 100");
  }

  // Ensure code is unique
  const existingCode = await (prisma as any).coupon.findUnique({
    where: { code: code.toUpperCase() }
  });

  if (existingCode) {
    throw new ApiError(400, "Coupon code already exists");
  }

  const coupon = await (prisma as any).coupon.create({
    data: {
      code: code.toUpperCase(),
      planId,
      percentage,
      isActive: true,
    },
  });

  res.status(201).json(new ApiResponse(201, "Coupon created successfully", coupon));
};

// @desc    Get all coupons
// @route   GET /api/v1/coupons
// @access  Superadmin
export const getAllCoupons = async (req: Request, res: Response) => {
  const coupons = await (prisma as any).coupon.findMany({
    include: {
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(new ApiResponse(200, "Coupons retrieved successfully", coupons));
};

// @desc    Get coupons for a specific plan
// @route   GET /api/v1/coupons/plan/:planId
// @access  Public / User
export const getCouponsByPlan = async (req: Request, res: Response) => {
  const { planId } = req.params;

  const coupons = await (prisma as any).coupon.findMany({
    where: { 
      planId,
      isActive: true
    },
    orderBy: { percentage: "desc" }, // Show highest discount first
  });

  res.status(200).json(new ApiResponse(200, "Coupons retrieved successfully", coupons));
};

// @desc    Toggle coupon active status
// @route   PUT /api/v1/coupons/:id/toggle
// @access  Superadmin
export const toggleCouponStatus = async (req: Request, res: Response) => {
  const { id } = req.params;

  const coupon = await (prisma as any).coupon.findUnique({
    where: { id },
  });

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  const updatedCoupon = await (prisma as any).coupon.update({
    where: { id },
    data: { isActive: !coupon.isActive },
  });

  res.status(200).json(new ApiResponse(200, "Coupon status updated successfully", updatedCoupon));
};

// @desc    Delete a coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Superadmin
export const deleteCoupon = async (req: Request, res: Response) => {
  const { id } = req.params;

  const coupon = await (prisma as any).coupon.findUnique({
    where: { id },
  });

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  await (prisma as any).coupon.delete({
    where: { id },
  });

  res.status(200).json(new ApiResponse(200, "Coupon deleted successfully", null));
};
