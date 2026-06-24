import { UserType } from "./../types/user-type.js";
import { Request, Response } from "express";
import ApiResponse from "../utils/ApiResponse.js";
import { updateTeamProfileSchema } from "../schema/teamSchema.js";
import { prisma } from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import { ZodError } from "zod";
import {
  changeContactDetailsSchema,
  changePasswordSchema,
} from "../schema/authSchema.js";
import { User } from "../types/user.js";
import {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import { JwtPayload, JwtPayloadRefresh } from "../types/jwt-payload.js";
import { Gender } from "../types/gender.js";
import { USER_ACCESS_TOKEN, USER_REFRESH_TOKEN } from "../utils/constant.js";
import storageProvider from "../services/storage/StorageProvide.js";
import { authUser } from "../utils/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { otpStore } from "./verification.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const TokenExpiredError = jwt.TokenExpiredError;

// export async function registerUser(req: Request, res: Response) {
//   try {
//     // Get IP and user agent
//     const ip = req.ip;
//     const userAgent = req.headers["user-agent"];

//     // Get data from user
//     const body = req.body;

//     // Validate request body
//     const data = await registerUserSchema.parseAsync(body);
//     const title = data.gender === "MALE" ? "Mr." : "Miss";

//     // Check if user already exists
//     const where: any = {
//       OR: [{ phone: data.phone }],
//     };
//     if (data.email) {
//       where.OR.push({ email: data.email });
//     }
//     const existUser = await prisma.user.findFirst({
//       where,
//     });

//     // User already exists
//     if (existUser) {
//       return res.status(400).json(new ApiError(400, "User already exists"));
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(data.password, 10);

//     // Check for password hash
//     if (!hashedPassword) {
//       return res.status(500).json(new ApiError(500, "Password hash failed"));
//     }

//     const currentUserType =
//       data.gender === Gender.FEMALE ? UserType.PAID_USER : UserType.FREE_USER;
//     const currentUserPlanExpire =
//       data.gender === Gender.FEMALE
//         ? new Date(new Date().setFullYear(new Date().getFullYear() + 5))
//         : new Date();

//     // Create user
//     const user = await prisma.user.create({
//       data: {
//         title,
//         firstName: data.firstName,
//         middleName: data.middleName,
//         lastName: data.lastName,
//         gender: data.gender,
//         email: data.email,
//         phone: data.phone,
//         type: currentUserType,
//         planExpiryDate: currentUserPlanExpire,
//       },
//     });

//     // Check for user creation
//     if (!user) {
//       return res
//         .status(500)
//         .json(new ApiError(500, "User registration failed"));
//     }

//     // Send response
//     res
//       .status(201)
//       .json(new ApiResponse(201, "User registered successfully", null));
//   } catch (error) {
//     if (error instanceof ZodError) {
//       res.status(400).json(new ApiError(400, error.errors[0]?.message || ""));
//     }
//   }
// }

// export async function loginUser(req: Request, res: Response) {
//   try {
//     // Get IP and user agent
//     const ip = req.ip;
//     const userAgent = req.headers["user-agent"];
//     // Get data from user
//     const body = req.body;

//     // Validate request body
//     const data = await loginUserSchema.parseAsync(body);

//     // Check if user exists
//     const user = await prisma.user.findFirst({
//       where: {
//         OR: [{ email: data.email }, { phone: data.email }],
//       },
//     });

//     // User not found
//     if (!user) {
//       return res.status(400).json(new ApiError(400, "User not found"));
//     }

//     // Check password
//     const isPasswordValid = await bcrypt.compare(data.password, user.password);

//     // Password not valid
//     if (!isPasswordValid) {
//       return res.status(401).json(new ApiError(401, "Invalid credentials"));
//     }

//     // Check if user is blocked
//     if (user.blocked === true) {
//       return res.status(403).json(new ApiError(403, "User is blocked"));
//     }

//     const tokenUser: User = {
//       id: user.id,
//       title: user.title,
//       firstName: user.firstName,
//       middleName: user.middleName,
//       lastName: user.lastName,
//       avatar: user.avatar,
//       gender: user.gender,
//       email: user.email,
//       phone: user.phone,
//       type: user.type as UserType,
//       planExpiryDate: user.activePlan?.planExpiryDate as Date,
//       tokenType: "USER",
//     };

//     //Generate tokens
//     const tokens = generateTokens(tokenUser);

//     // Save IP and user agent to database
//     await prisma.refreshToken.upsert({
//       where: {
//         userId: user.id,
//       },
//       create: {
//         userId: user.id,
//         token: tokens.refreshToken,
//         ip: ip,
//         userAgent: userAgent,
//       },
//       update: {
//         userId: user.id,
//         token: tokens.refreshToken,
//         ip: ip,
//         userAgent: userAgent,
//       },
//     });

//     // Save token to cookie
//     const isProduction = process.env.NODE_ENV === "production";

//     // Save token to cookie
//     res.cookie(USER_ACCESS_TOKEN, tokens.accessToken, {
//       httpOnly: true,
//       secure: isProduction,
//       sameSite: isProduction ? "none" : "lax",
//       domain: isProduction ? ".betadebug.com" : "localhost",
//     });
//     res.cookie(USER_REFRESH_TOKEN, tokens.refreshToken, {
//       httpOnly: true,
//       secure: isProduction,
//       sameSite: isProduction ? "none" : "lax",
//       domain: isProduction ? ".betadebug.com" : "localhost",
//     });

//     const responseUser = {
//       ...tokenUser,
//       title: user.title,
//       avatar: user?.avatar || null,
//       planExpiryDate: user?.activePlan?.planExpiryDate,
//       accessToken: tokens?.accessToken,
//       refreshToken: tokens?.refreshToken,
//     };

//     // Send response
//     return res
//       .status(200)
//       .json(new ApiResponse(200, "User logged in successfully", responseUser));
//   } catch (error) {
//     if (error instanceof ZodError) {
//       return res
//         .status(400)
//         .json(new ApiError(400, error.errors[0]?.message || ""));
//     }

//     return res.status(500).json(new ApiError(500, "Internal server error"));
//   }
// }

// export async function refreshToken(req: Request, res: Response) {
//   try {
//     // Get refresh token from cookie
//     const refreshToken =
//       req.headers.authorization?.split("Bearer ")[1] ||
//       req.headers.cookie?.split("refreshToken=")[1]?.split(";")[0];

//     // Check if refresh token exists
//     if (!refreshToken) {
//       return res.status(400).json(new ApiError(400, "Refresh token not found"));
//     }

//     let decodedRefreshToken;
//     try {
//       decodedRefreshToken = verifyRefreshToken(
//         refreshToken
//       ) as JwtPayloadRefresh;
//     } catch (err) {
//       return res.status(401).json(new ApiError(401, "Invalid refresh token"));
//     }

//     if (!decodedRefreshToken?.id) {
//       return res.status(401).json(new ApiError(401, "Invalid refresh token"));
//     }

//     const userFindByToken = await prisma.refreshToken.findFirst({
//       where: {
//         token: refreshToken,
//       },
//       select: {
//         user: {
//           select: {
//             id: true,
//             title: true,
//             firstName: true,
//             middleName: true,
//             lastName: true,
//             avatar: true,
//             gender: true,
//             email: true,
//             phone: true,
//             type: true,
//             blocked: true,
//             profile: true,
//             activePlan: {
//               select: {
//                 planExpiryDate: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     // Check if refresh token is valid
//     if (!userFindByToken) {
//       return res.status(401).json(new ApiError(401, "Invalid refresh token"));
//     }

//     if (userFindByToken.user.id !== decodedRefreshToken.id) {
//       return res.status(401).json(new ApiError(401, "Invalid refresh token"));
//     }

//     if (userFindByToken.user.blocked === true) {
//       return res.status(401).json(new ApiError(403, "User is blocked"));
//     }

//     const user = userFindByToken.user;
//     const tokenUser: User = {
//       id: user?.id as string,
//       title: user?.title as string,
//       firstName: user?.firstName as string,
//       middleName: user?.middleName as string,
//       lastName: user?.lastName as string,
//       avatar: user?.avatar as string,
//       gender: user?.gender as string,
//       email: user?.email as string,
//       phone: user?.phone as string,
//       type: user?.type as UserType,
//       planExpiryDate: user?.activePlan?.planExpiryDate as Date,
//       tokenType: "USER",
//     };
//     // Generate new access token
//     const accessToken = generateAccessToken(tokenUser);

//     // Save access token to cookie
//     const isProduction = process.env.NODE_ENV === "production";
//     res.cookie(USER_ACCESS_TOKEN, accessToken, {
//       httpOnly: true,
//       secure: isProduction,
//       sameSite: isProduction ? "none" : "lax",
//       domain: isProduction ? ".betadebug.com" : "localhost",
//     });

//     // Send response
//     return res
//       .status(200)
//       .json(new ApiResponse(200, "Token refreshed successfully", accessToken));
//   } catch (error) {
//     console.log("error", error);

//     if (error instanceof TokenExpiredError) {
//       return res.status(401).json(new ApiError(401, "Invalid refresh token"));
//     }
//     return res.status(500).json(new ApiError(500, "Internal server error"));
//   }
// }

// export async function logoutUser(req: Request, res: Response) {
//   try {
//     // Get refresh token from cookie
//     const refreshToken = req.cookies.refreshToken;

//     // Check if refresh token exists
//     if (!refreshToken) {
//       return res.status(401).json(new ApiError(401, "Refresh token not found"));
//     }

//     // Delete refresh token from database
//     await prisma.refreshToken.deleteMany({
//       where: {
//         token: refreshToken,
//       },
//     });

//     // Clear cookies
//     res.clearCookie(USER_ACCESS_TOKEN);
//     res.clearCookie(USER_REFRESH_TOKEN);

//     // Send response
//     return res
//       .status(200)
//       .json(new ApiResponse(200, "User logged out successfully", null));
//   } catch (error) {
//     return res.status(500).json(new ApiError(500, "Internal server error"));
//   }
// }

// export async function loginSystemUser(req: Request, res: Response) {
//   try {
//     // Get data from user
//     const body = req.body;

//     // Validate request body
//     //const data = await loginTeamSchema.parseAsync(body);

//     // Check if user exists
//     // const user = await prisma.team.findFirst({
//     //   where: {
//     //     OR: [{ email: data.email }, { phone: data.email }],
//     //   },
//     // });

//     // User not found
//     // if (!user) {
//     //   return res.status(400).json(new ApiError(400, "Invalid credentials"));
//     // }

//     // Check if user is blocked
//     // if (user.blocked === true) {
//     //   return res.status(400).json(new ApiError(400, "User is blocked"));
//     // }

//     // Check password
//     //const isPasswordValid = await bcrypt.compare(data.password, user.password);

//     // Password not valid
//     // if (!isPasswordValid) {
//     //   return res.status(400).json(new ApiError(400, "Invalid credentials"));
//     // }

//     // const responseUser: SystemUser = {
//     //   id: user.id,
//     //   firstName: user.firstName,
//     //   middleName: user.middleName || "",
//     //   lastName: user.lastName,
//     //   avatar: user.avatar,
//     //   phone: user.phone,
//     //   email: user.email,
//     //   role: user.role as Role,
//     //   isProfileComplete: user.isProfileComplete,
//     //   tokenType: "TEAM",
//     // };

//     // const tokens = generateSystemTokens(responseUser);

//     // await prisma.teamRefreshToken.upsert({
//     //   where: {
//     //     teamId: user.id,
//     //   },
//     //   update: {
//     //     token: tokens.refreshToken,
//     //     ip,
//     //     userAgent,
//     //   },
//     //   create: {
//     //     teamId: user.id,
//     //     token: tokens.refreshToken,
//     //     ip,
//     //     userAgent,
//     //   },
//     // });

//     // // Save token to cookie
//     // const isProduction = process.env.NODE_ENV === "production";
//     // res.cookie(SYSTEM_ACCESS_TOKEN, tokens.accessToken, {
//     //   httpOnly: true,
//     //   secure: isProduction,
//     //   sameSite: isProduction ? "none" : "lax",
//     //   domain: isProduction ? ".betadebug.com" : "localhost",
//     // });
//     // res.cookie(SYSTEM_REFRESH_TOKEN, tokens.refreshToken, {
//     //   httpOnly: true,
//     //   secure: isProduction,
//     //   sameSite: isProduction ? "none" : "lax",
//     //   domain: isProduction ? ".betadebug.com" : "localhost",
//     // });

//     // const responseUserWithTokens = { ...responseUser, ...tokens };

//     // Send response
//     return res.status(200).json(new ApiResponse(200, "", body));
//   } catch (error) {
//     console.log(error);
//     if (error instanceof ZodError) {
//       return res
//         .status(400)
//         .json(new ApiError(400, error.errors[0]?.message as string));
//     }
//     return res.status(500).json(new ApiError(500, "Internal server error"));
//   }
// }

// export async function updateteamProfile(req: Request, res: Response) {
//   try {
//     const userId = req.user?.id;
//     const file = req.file;

//     if (!userId) {
//       return res.status(400).json(new ApiError(400, "User not found"));
//     }

//     if (!file) {
//       return res.status(400).json(new ApiError(400, "File not found"));
//     }

//     const {
//       dob,
//       addressLine1,
//       addressLine2,
//       postOffice,
//       policeStation,
//       dist,
//       state,
//       pinCode,
//     } = await updateTeamProfileSchema.parseAsync(req.body);

//     const identificationProof = await storageProvider.upload(
//       file,
//       "docs/idcard"
//     );

//     const profile = await prisma.team.update({
//       where: {
//         id: userId,
//       },
//       data: {
//         profile: {
//           upsert: {
//             update: {
//               dob,
//               identificationProof,
//               addressLine1,
//               addressLine2,
//               postOffice,
//               policeStation,
//               dist,
//               state,
//               pinCode,
//             },
//             create: {
//               dob,
//               identificationProof,
//               addressLine1,
//               addressLine2,
//               postOffice,
//               policeStation,
//               dist,
//               state,
//               pinCode,
//             },
//           },
//         },
//       },
//     });
//     return res
//       .status(200)
//       .json(new ApiResponse(200, "Profile updated", profile));
//   } catch (error) {
//     if (error instanceof ZodError) {
//       return res.status(401).json(new ApiError(401, error.issues[0].message));
//     }
//     return res.status(500).json(new ApiError(500, "Internal server error"));
//   }
// }

export async function updateTeamProfileRequest(req: Request, res: Response) {
  try {
    const userId = req.systemUser?.id;
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const profileImageFile = files.profileImage?.[0];
    const identificationProofFile = files.identificationProof?.[0];

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    if (!profileImageFile) {
      return res.status(400).json(new ApiError(400, "Profile image not found"));
    }

    if (!identificationProofFile) {
      return res
        .status(400)
        .json(new ApiError(400, "Identification proof not found"));
    }

    const {
      dob,
      addressLine1,
      addressLine2,
      postOffice,
      policeStation,
      dist,
      state,
      pinCode,
    } = await updateTeamProfileSchema.parseAsync(req.body);

    const profileImage = await storageProvider.upload(
      profileImageFile,
      "images/avatars/team"
    );

    // ✅ Use our storage abstraction instead of direct Cloudinary
    const identificationProof = await storageProvider.upload(
      identificationProofFile,
      "docs/idcard"
    );

    const profile = await prisma.teamProfileRequest.upsert({
      where: { teamId: userId }, // unique field
      update: {
        avatar: profileImage,
        dob,
        identificationProof,
        addressLine1,
        addressLine2,
        postOffice,
        policeStation,
        dist,
        state,
        pinCode,
      },
      create: {
        avatar: profileImage,
        teamId: userId,
        dob,
        identificationProof,
        addressLine1,
        addressLine2,
        postOffice,
        policeStation,
        dist,
        state,
        pinCode,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Profile updated", profile.id));
  } catch (error) {
    console.log(error);
    if (error instanceof ZodError) {
      return res
        .status(401)
        .json(new ApiError(401, error.issues[0]?.message as string));
    }
    return res.status(500).json(new ApiError(500, error instanceof Error ? error.message : "Internal server error"));
  }
}

export async function teamProfileRequestFind(req: Request, res: Response) {
  try {
    const userId = req.systemUser?.id;

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    const profile = await prisma.teamProfileRequest.findFirst({
      where: { teamId: userId }, // unique field
      select: {
        id: true,
      },
    });

    if (!profile) {
      return res.status(404).json(new ApiError(404, "Profile not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Profile found", profile?.id));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function teamProfileRequestStatus(req: Request, res: Response) {
  try {
    const profileId = req.params.profileId;
    const userId = req.systemUser?.id;

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    if (!profileId) {
      return res.status(400).json(new ApiError(400, "Profile not found"));
    }

    const profile = await prisma.teamProfileRequest.findFirst({
      where: {
        id: profileId,
        teamId: userId,
      }, // unique field
      select: {
        avatar: true,
        dob: true,
        identificationProof: true,
        addressLine1: true,
        addressLine2: true,
        postOffice: true,
        policeStation: true,
        dist: true,
        state: true,
        pinCode: true,
        status: true,
        createdAt: true,
        team: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Profile details fetched", profile));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getAllHelpRequests(req: Request, res: Response) {
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

    const [helpRequests, totalData] = await prisma.$transaction([
      prisma.helpRequest.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          reason: true,
          message: true,
          feedback: true,
          status: true,
          isReopened: true,
          createdAt: true,
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              senderType: true,
            },
          },
        },

        skip,
        take: limitNum,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.helpRequest.count(),
    ]);

    const processedRequests = helpRequests.map((req) => {
      const isNew = req.messages.length === 0 && req.status === "PENDING";
      const hasUnread = req.messages[0]?.senderType === "GUEST";
      const latestMessageId = req.messages[0]?.id || null;
      const { messages, ...rest } = req;
      return {
        ...rest,
        isNew,
        hasUnread,
        latestMessageId,
      };
    });

    const totalPages = Math.ceil(totalData / limitNum);

    res.status(200).json(
      new ApiResponse(200, "Help requests fetched", {
        totalData,
        totalPages,
        currentPage: pageNum,
        pageSize: limitNum,
        data: processedRequests,
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getSingleHelpRequestById(req: Request, res: Response) {
  try {
    const requestId = req.params.requestId;

    if (!requestId) {
      return res.status(400).json(new ApiError(400, "Request ID is required"));
    }

    const data = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        reason: true,
        message: true,
        status: true,
        adminNote: true,
        feedback: true,
        isReopened: true,
        createdAt: true,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Help requests fetched", data));
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function sendAdminHelpMessage(req: Request, res: Response) {
  try {
    const requestId = req.params.requestId;
    const { content } = req.body;
    const adminId = (req as any).systemUser?.id;

    if (!requestId) {
      return res.status(400).json(new ApiError(400, "Invalid request id"));
    }
    if (!content) {
      return res.status(400).json(new ApiError(400, "Message content is required"));
    }
    if (!adminId) {
      return res.status(401).json(new ApiError(401, "Unauthorized access"));
    }

    const ticket = await prisma.helpRequest.findUnique({ where: { id: requestId } });
    if (!ticket) {
      return res.status(404).json(new ApiError(404, "Ticket not found"));
    }

    const message = await prisma.helpRequestMessage.create({
      data: {
        helpRequestId: requestId,
        senderType: "TEAM",
        senderId: adminId,
        content,
      },
      include: {
        teamSender: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    await prisma.helpRequest.update({
      where: { id: requestId },
      data: { updatedAt: new Date() },
    });

    return res.status(201).json(new ApiResponse(201, "Admin reply sent successfully", message));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function updateHelpRequestStatus(req: Request, res: Response) {
  try {
    const { requestId, status, feedback } = req.body;

    if (!requestId || !status) {
      return res
        .status(400)
        .json(new ApiError(400, "Request ID and status are required"));
    }

    await prisma.helpRequest.update({
      where: { id: requestId },
      data: {
        status,
        adminNote: feedback,
        resolvedAt: status === "RESOLVED" ? new Date() : null,
        isReopened: false, // admin action always clears the reopen flag
      },
    });

    if (status === "RESOLVED") {
      const adminId = (req as any).systemUser?.id;
      let adminInfo = "Admin";
      if (adminId) {
        const admin = await prisma.team.findUnique({ where: { id: adminId } });
        if (admin) {
          adminInfo = `${admin.firstName} ${admin.lastName} (${adminId})`;
        } else {
          adminInfo = `Admin (${adminId})`;
        }
      }
      
      await prisma.helpRequestMessage.create({
        data: {
          helpRequestId: requestId,
          senderType: "TEAM",
          senderId: adminId || null,
          content: `This request has been marked as resolved. The chat is now closed.`,
        }
      });
    }

    res.status(200).json(new ApiResponse(200, "Request status updated", null));
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { target, otp, newPassword } = req.body;

  if (!target || !otp || !newPassword) {
    throw new ApiError(400, "Please provide target, otp, and newPassword");
  }

  const storedData = otpStore.get(target);

  if (!storedData) {
    throw new ApiError(400, "No OTP found or it has expired. Please request a new one.");
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(target);
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  if (storedData.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  // OTP is valid, hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user
  const isEmail = target.includes("@");
  const user = await prisma.user.findFirst({
    where: isEmail ? { email: target } : { phone: target },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update password in UserAccount
  const userAccount = await prisma.userAccount.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });

  if (userAccount) {
    await prisma.userAccount.update({
      where: { id: userAccount.id },
      data: { password: hashedPassword },
    });
  } else {
    await prisma.userAccount.create({
      data: {
        userId: user.id,
        providerId: "credential",
        accountId: target,
        password: hashedPassword,
      }
    });
  }

  // clear the OTP after successful reset
  otpStore.delete(target);

  res.status(200).json(new ApiResponse(200, "Password reset successfully", null));
});
