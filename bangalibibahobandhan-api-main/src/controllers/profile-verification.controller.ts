import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { prisma } from "../config/db.js";
import { Gender, ModerationStatus } from "@prisma/client";

// Get pending verifications (Filtered by gender based on role)
export const getPendingVerifications = asyncHandler(async (req: Request, res: Response) => {
  const genderFilter = req.query.gender as string; // Optional filter from frontend

  const whereClause: any = {
    verificationStatus: ModerationStatus.PENDING,
    // Only users who have completed their profile should be reviewed
    isProfileComplete: true,
  };

  if (genderFilter === "MALE") {
    whereClause.gender = Gender.MALE;
  } else if (genderFilter === "FEMALE") {
    whereClause.gender = Gender.FEMALE;
  }

  const pendingUsers = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      publicId: true,
      firstName: true,
      lastName: true,
      gender: true,
      avatar: true,
      verificationSelfieUrl: true,
      verificationStatus: true,
      createdAt: true,
      profile: {
        select: {
          profileImages: true,
        }
      }
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json(new ApiResponse(200, "Pending verifications fetched successfully", pendingUsers));
});

// Approve verification
export const approveVerification = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationStatus: ModerationStatus.APPROVED,
      isProfilePublic: true, // Make their profile public!
    },
  });

  res.status(200).json(new ApiResponse(200, "Profile verification approved successfully", null));
});

// Reject verification
export const rejectVerification = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationStatus: ModerationStatus.REJECTED,
      isProfilePublic: false,
    },
  });

  res.status(200).json(new ApiResponse(200, "Profile verification rejected", null));
});
