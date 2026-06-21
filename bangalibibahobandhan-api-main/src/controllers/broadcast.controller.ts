import { Request, Response } from "express";
import { prisma } from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { authUser } from "../utils/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import storageProvider from "../services/storage/StorageProvide.js";

// Create a new Broadcast (SuperAdmin)
export async function createBroadcast(req: Request, res: Response) {
  try {
    const { content, targetGender } = req.body;

    if (!content) {
      return res
        .status(400)
        .json(new ApiError(400, "Broadcast content is required"));
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = await storageProvider.upload(req.file, "images/broadcasts");
    }

    const broadcast = await prisma.broadcastMessage.create({
      data: {
        content,
        targetGender: targetGender || null, // MALE, FEMALE, or null for ALL
        imageUrl,
        isActive: true,
      } as any,
    });

    res.status(201).json({
      success: true,
      data: broadcast,
    });
  } catch (error: any) {
    res.status(500).json(new ApiError(500, error.message || "Server Error"));
  }
}

// Get Active Broadcast for User
export async function getActiveBroadcast(req: Request, res: Response) {
  try {
    const session = await authUser.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    
    const user = session?.user;
    
    // Default to guests (only see broadcasts for EVERYONE)
    let genderFilter: any = { targetGender: null };

    if (user && user.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { gender: true, type: true, planExpiryDate: true }
      });

      if (dbUser) {
        const orConditions: any[] = [{ targetGender: null }];
        
        // Add gender specific condition
        orConditions.push({ targetGender: dbUser.gender });

        // Add Groom-specific conditions
        if (dbUser.gender === "MALE") {
          const now = new Date();
          if (dbUser.type === "FREE") {
            orConditions.push({ targetGender: "FREE_GROOM" });
          } else if (dbUser.type === "PAID") {
            if (dbUser.planExpiryDate && dbUser.planExpiryDate > now) {
              orConditions.push({ targetGender: "PAID_GROOM" });
            } else {
              orConditions.push({ targetGender: "EXPIRED_GROOM" });
            }
          }
        }

        genderFilter = { OR: orConditions };
      } else if (user.gender) {
        // Fallback if dbUser not found but session has gender
        genderFilter = {
          OR: [
            { targetGender: null },
            { targetGender: user.gender }
          ]
        };
      }
    }

    const broadcasts = await prisma.broadcastMessage.findMany({
      where: {
        isActive: true,
        ...genderFilter
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5, // Return a few latest active ones
    });

    res.status(200).json({
      success: true,
      data: broadcasts,
    });
  } catch (error: any) {
    res.status(500).json(new ApiError(500, error.message || "Server Error"));
  }
}

// Get All Broadcasts (SuperAdmin)
export async function getAllBroadcasts(req: Request, res: Response) {
  try {
    const broadcasts = await prisma.broadcastMessage.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: broadcasts,
    });
  } catch (error: any) {
    res.status(500).json(new ApiError(500, error.message || "Server Error"));
  }
}

// Deactivate a Broadcast (SuperAdmin)
export async function deactivateBroadcast(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const broadcast = await prisma.broadcastMessage.update({
      where: { id },
      data: { isActive: false },
    });

    res.status(200).json({
      success: true,
      data: broadcast,
    });
  } catch (error: any) {
    res.status(500).json(new ApiError(500, error.message || "Server Error"));
  }
}
