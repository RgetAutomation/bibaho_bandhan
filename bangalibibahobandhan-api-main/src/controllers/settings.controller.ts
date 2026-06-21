import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { prisma } from "../config/db.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

// @desc    Get system settings
// @route   GET /api/v1/superadmin/settings
// @access  Private (SuperAdmin)
export const getSystemSettings = asyncHandler(
  async (req: Request, res: Response) => {
    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {},
      });
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, "System settings fetched successfully", settings)
      );
  }
);

// @desc    Update system settings
// @route   PUT /api/v1/superadmin/settings
// @access  Private (SuperAdmin)
export const updateSystemSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smsGatewayUrl,
      smsApiKey,
    } = req.body;

    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          smtpHost,
          smtpPort: smtpPort ? parseInt(smtpPort) : null,
          smtpUser,
          smtpPass,
          smsGatewayUrl,
          smsApiKey,
        },
      });
    } else {
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          smtpHost,
          smtpPort: smtpPort ? parseInt(smtpPort) : null,
          smtpUser,
          smtpPass,
          smsGatewayUrl,
          smsApiKey,
        },
      });
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, "System settings updated successfully", settings)
      );
  }
);
