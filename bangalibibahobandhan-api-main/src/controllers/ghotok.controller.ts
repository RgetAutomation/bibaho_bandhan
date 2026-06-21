import { Request, Response } from "express";
import { prisma } from "../config/db.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { registerSystemUserSchema } from "../schema/authSchema.js";
import bcrypt from "bcrypt";
import { Gender } from "../types/gender.js";
import z, { ZodError } from "zod";
import { createGhotokUserSchema } from "../schema/ghotok/userSchema.js";
import { generateStrongPassword } from "../utils/generatePassword.js";
import { UserType } from "../types/user-type.js";
import { updateUserProfileSchema } from "../schema/userSchema.js";
import storageProvider from "../services/storage/StorageProvide.js";
import { ConnectionStatus } from "../utils/enum/ConnectionStatus.js";
import { generateConversationId } from "../utils/generateConversationID.js";
import { id } from "zod/v4/locales";

export async function ghotokDashboard(req: Request, res: Response) {
  const currentUserId = req.systemUser?.id;
  try {
    // Get data from database
    const [brides, grooms, connectionRequests, matchedGroom] =
      await prisma.$transaction([
        prisma.user.count({
          where: {
            isGhotokOwned: true,
            ghotokId: currentUserId,
            gender: Gender.FEMALE,
          },
        }),
        prisma.user.count({
          where: {
            isGhotokOwned: true,
            ghotokId: currentUserId,
            gender: Gender.MALE,
          },
        }),
        prisma.friendRequest.count({
          where: {
            status: "SENT",
            OR: [
              // {
              //   sender: {
              //     isGhotokOwned: true,
              //     ghotokId: currentUserId,
              //   },
              // },
              {
                receiver: {
                  isGhotokOwned: true,
                  ghotokId: currentUserId,
                },
              },
            ],
          },
        }),
        prisma.user.count({
          where: {
            gender: "MALE",
            hasMatched: true,
            isGhotokOwned: true,
            ghotokId: currentUserId,
          },
        }),
      ]);
    const formattedData = {
      brides: brides,
      grooms: grooms,
      connectionRequest: connectionRequests,
      paidMatching: matchedGroom,
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

export async function joinGhotokRequestUser(req: Request, res: Response) {
  try {
    // Get IP and user agent
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];

    // Get data from user
    const body = req.body;

    // Validate request body
    const data = await registerSystemUserSchema.parseAsync(body);

    const [existTeam, existJoinGhotok] = await prisma.$transaction([
      prisma.team.findFirst({
        where: {
          OR: [{ email: data.email }, { phone: data.phone }],
        },
      }),
      prisma.joinGhotokRequest.findFirst({
        where: {
          OR: [{ email: data.email }, { phone: data.phone }],
        },
      }),
    ]);

    const existUser = existTeam || existJoinGhotok;

    // User already exists
    if (existUser) {
      return res.status(400).json(new ApiError(400, "Account already exists"));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Check for password hash
    if (!hashedPassword) {
      return res.status(500).json(new ApiError(500, "Password hash failed"));
    }

    // Create user
    const user = await prisma.joinGhotokRequest.create({
      data: {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        gender: data.gender as Gender,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
      },
    });

    // Check for user creation
    if (!user) {
      return res
        .status(500)
        .json(new ApiError(500, "User registration failed"));
    }

    // Send response
    return res
      .status(201)
      .json(new ApiResponse(201, "Join request created successfully", user.id));
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

export async function joinGhotokRequestUserSearch(req: Request, res: Response) {
  try {
    // Get data from user
    const { requestId, phone, email } = req.body;

    const request = await prisma.joinGhotokRequest.findFirst({
      where: {
        OR: [{ id: requestId }, { email: email }, { phone: phone }],
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

export async function getGhotokRequestById(req: Request, res: Response) {
  try {
    // Get data from user
    const requestId = req.params.userId;

    // Check if request id is valid
    if (!requestId) {
      return res.status(400).json(new ApiError(400, "Invalid request id"));
    }

    const requestedUser = await prisma.joinGhotokRequest.findFirst({
      where: { id: requestId },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        email: true,
        phone: true,
        status: true,
      },
    });

    // Send response
    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          "Ghotok request fetched successfully",
          requestedUser
        )
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function ghotokAllBrides(req: Request, res: Response) {
  try {
    const currentUserId = req.systemUser?.id;
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

    const [users, totalData] = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          isGhotokOwned: true,
          ghotokId: currentUserId,
          gender: Gender.FEMALE,
        },
        select: {
          id: true,
          publicId: true,
          title: true,
          firstName: true,
          middleName: true,
          lastName: true,
          gender: true,
          phone: true,
          avatar: true,
          isProfileComplete: true,
          blocked: true,
        },

        skip,
        take: limitNum,
        orderBy: { blocked: "asc" },
      }),
      prisma.user.count({
        where: {
          isGhotokOwned: true,
          ghotokId: currentUserId,
          gender: Gender.FEMALE,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalData / limitNum);

    return res.status(200).json(
      new ApiResponse(200, "Success", {
        totalData,
        totalPages,
        currentPage: pageNum,
        pageSize: limitNum,
        data: users,
      })
    );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function ghotokAllGrooms(req: Request, res: Response) {
  try {
    const currentUserId = req.systemUser?.id;
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

    const [users, totalData] = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          isGhotokOwned: true,
          ghotokId: currentUserId,
          gender: Gender.MALE,
        },
        select: {
          id: true,
          publicId: true,
          title: true,
          firstName: true,
          middleName: true,
          lastName: true,
          gender: true,
          phone: true,
          avatar: true,
          isProfileComplete: true,
          blocked: true,
        },

        skip,
        take: limitNum,
        orderBy: { blocked: "asc" },
      }),
      prisma.user.count({
        where: {
          isGhotokOwned: true,
          ghotokId: currentUserId,
          gender: Gender.MALE,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalData / limitNum);

    return res.status(200).json(
      new ApiResponse(200, "Success", {
        totalData,
        totalPages,
        currentPage: pageNum,
        pageSize: limitNum,
        data: users,
      })
    );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getUserDetailsByIdForGhotok(req: Request, res: Response) {
  try {
    const requestedUserId = req.params.id;
    const targetUser = await prisma.user.findUnique({
      where: { id: requestedUserId },
      select: {
        id: true,
        publicId: true,
        title: true,
        lastName: true,
        gender: true,
        avatar: true,
        isGhotokOwned: true,
        ghotok: {
          select: {
            ghotokPublicId: true,
          },
        },
        profile: {
          select: {
            profileImages: {
              select: {
                id: true,
                url: true,
              },
            },
            dob: true,
            maritalStatus: true,
            children: true,
            speciallyAble: true,
            religion: true,
            gotra: true,
            caste: true,
            subCaste: true,
            manglikDosh: true,
            height: true,
            weight: true,
            bloodGroup: true,
            dist: true,
            state: true,
            skinTone: true,
            bodyType: true,
            eatingHabits: true,
            drinkingHabits: true,
            smokingHabits: true,
            profession: true,
            education: true,
            hobbies: true,
            monthlyIncome: true,
            language: true,
            familyMembers: true,
            fatherProfession: true,
            candidatePreference: true,
            locationPreference: true,
            aboutMyself: true,
            aboutMyPartner: true,
          },
        },
      },
    });

    if (!targetUser) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    //Calculate Age
    const dob = targetUser?.profile?.dob ?? new Date(0);
    const age = new Date().getFullYear() - new Date(dob).getFullYear();

    const fullInfo = {
      id: targetUser.id,
      publicId: targetUser.publicId,
      title: targetUser.title,
      lastName: targetUser.lastName,
      gender: targetUser.gender,
      age: age,
      avatar: targetUser?.avatar,
      dist: targetUser.profile?.dist,
      state: targetUser.profile?.state,
      maritalStatus: targetUser.profile?.maritalStatus,
      religion: targetUser.profile?.religion,
      gotra: targetUser.profile?.gotra,
      caste: targetUser.profile?.caste,
      subCaste: targetUser.profile?.subCaste,
      manglikDosh: targetUser.profile?.manglikDosh,
      language: targetUser.profile?.language,
      profileImages: targetUser.profile?.profileImages,
      children: targetUser.profile?.children,
      speciallyAble: targetUser.profile?.speciallyAble,
      height: targetUser.profile?.height,
      weight: targetUser.profile?.weight,
      bloodGroup: targetUser.profile?.bloodGroup,
      skinTone: targetUser.profile?.skinTone,
      bodyType: targetUser.profile?.bodyType,
      eatingHabits: targetUser.profile?.eatingHabits,
      drinkingHabits: targetUser.profile?.drinkingHabits,
      smokingHabits: targetUser.profile?.smokingHabits,
      profession: targetUser.profile?.profession,
      education: targetUser.profile?.education,
      hobbies: targetUser.profile?.hobbies,
      monthlyIncome: targetUser.profile?.monthlyIncome,
      familyMembers: targetUser.profile?.familyMembers,
      fatherProfession: targetUser.profile?.fatherProfession,
      candidatePreference: targetUser.profile?.candidatePreference,
      locationPreference: targetUser.profile?.locationPreference,
      aboutMyself: targetUser.profile?.aboutMyself,
      aboutMyPartner: targetUser.profile?.aboutMyPartner,
      isGhotokOwned: targetUser.isGhotokOwned,
      ghotokPublicId: targetUser.ghotok?.ghotokPublicId,
    };

    res.json(new ApiResponse(200, "User fetched successfully", fullInfo));
  } catch (err) {
    console.error(err);
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

function generateUniqueId(): string {
  // Prefix "NOA" + random 6-digit number
  const randomPart = Math.floor(10000000 + Math.random() * 90000000);
  return `BBB${randomPart}`;
}

export async function createGhotokUser(req: Request, res: Response) {
  try {
    const currentUserId = req.systemUser?.id;

    if (!currentUserId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    // Get data from user
    const body = req.body;

    // Validate request body
    const data = await createGhotokUserSchema.parseAsync(body);
    const title = data.gender === "MALE" ? "Mr." : "Miss";

    // Check if user already exists
    const existUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.phone }],
      },
    });

    // User already exists
    if (existUser) {
      return res.status(400).json(new ApiError(400, "User already exists"));
    }

    // Hash password
    const generatedPassword = generateStrongPassword(10);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Check for password hash
    if (!hashedPassword) {
      return res.status(500).json(new ApiError(500, "Password hash failed"));
    }

    const currentUserPlanExpire = new Date(
      new Date().setFullYear(new Date().getFullYear() + 10)
    );

    // Generate unique custom ID
    let customId = generateUniqueId();
    let exists = await prisma.user.findUnique({
      where: { publicId: customId },
      select: { id: true },
    });

    // Ensure uniqueness by regenerating if exists
    while (exists) {
      customId = generateUniqueId();
      exists = await prisma.user.findUnique({
        where: { publicId: customId },
        select: { id: true },
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        title,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        gender: data.gender,
        email: data.email,
        phone: data.phone,
        type: UserType.PAID_USER,
        isGhotokOwned: true,
        ghotokId: currentUserId || "",
        publicId: customId,
        planExpiryDate: currentUserPlanExpire,
      },
    });

    // Check for user creation
    if (!user) {
      return res
        .status(500)
        .json(new ApiError(500, "User registration failed"));
    }

    res
      .status(201)
      .json(new ApiResponse(201, "User created successfully", null));
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json(new ApiError(400, error.errors[0]?.message || ""));
    }
  }
}

export async function viewGhotokUserProfileById(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const currentUserId = req.systemUser?.id;

    if (!currentUserId) {
      return res.status(400).json(new ApiError(400, "Session not found"));
    }

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User ID not found"));
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, isGhotokOwned: true, ghotokId: currentUserId },
      select: {
        id: true,
        title: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        avatar: true,
        phone: true,
        type: true,
        isProfilePublic: true,
        allowSocialPublish: true,
        profile: {
          select: {
            profileImages: {
              select: {
                id: true,
                url: true,
              },
            },
            dob: true,
            dist: true,
            state: true,
            maritalStatus: true,
            children: true,
            speciallyAble: true,
            religion: true,
            gotra: true,
            caste: true,
            subCaste: true,
            manglikDosh: true,
            height: true,
            weight: true,
            bloodGroup: true,
            skinTone: true,
            bodyType: true,
            eatingHabits: true,
            drinkingHabits: true,
            smokingHabits: true,
            profession: true,
            education: true,
            hobbies: true,
            monthlyIncome: true,
            language: true,
            familyMembers: true,
            fatherProfession: true,
            candidatePreference: true,
            locationPreference: true,
            aboutMyself: true,
            aboutMyPartner: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    //Calculate Age
    const dob = user?.profile?.dob ?? new Date(0);
    const age = new Date().getFullYear() - new Date(dob).getFullYear();

    const userWithAge = { ...user, age };

    res.status(200).json(new ApiResponse(200, "User found", userWithAge));
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json(new ApiError(400, error.errors[0]?.message || ""));
    } else {
      res.status(500).json(new ApiError(500, "Internal server error"));
    }
  }
}

export async function loadGhotokUserProfileDataForEdit(
  req: Request,
  res: Response
) {
  try {
    const userId = req.params.userId;
    const currentUserId = req.systemUser?.id;

    if (!currentUserId) {
      return res.status(400).json(new ApiError(400, "Session not found"));
    }

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User ID not found"));
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, isGhotokOwned: true, ghotokId: currentUserId },
      select: {
        id: true,
        title: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        avatar: true,
        phone: true,
        type: true,
        isProfilePublic: true,
        allowSocialPublish: true,
        profile: {
          select: {
            profileImages: {
              select: {
                id: true,
                url: true,
              },
            },
            dob: true,
            maritalStatus: true,
            children: true,
            speciallyAble: true,
            religion: true,
            gotra: true,
            caste: true,
            subCaste: true,
            manglikDosh: true,

            addressLine1: true,
            addressLine2: true,
            postOffice: true,
            policeStation: true,
            dist: true,
            state: true,
            pinCode: true,
            whatsappNumber: true,
            alternatePhone: true,

            height: true,
            weight: true,
            bloodGroup: true,
            skinTone: true,
            bodyType: true,
            eatingHabits: true,
            drinkingHabits: true,
            smokingHabits: true,

            aboutMyself: true,
            profession: true,
            education: true,
            hobbies: true,
            monthlyIncome: true,
            language: true,
            familyMembers: true,
            fatherProfession: true,
            candidatePreference: true,
            locationPreference: true,
            aboutMyPartner: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    const formattedData = {
      id: user.id,
      title: user.title,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      gender: user.gender,
      avatar: user.avatar,
      phone: user.phone,
      type: user.type,
      isProfilePublic: user.isProfilePublic,
      allowSocialPublish: user.allowSocialPublish,
      profileImages: user?.profile?.profileImages,
      dob: user?.profile?.dob,
      maritalStatus: user?.profile?.maritalStatus,
      children: user?.profile?.children,
      speciallyAble: user?.profile?.speciallyAble,
      religion: user?.profile?.religion,
      gotra: user?.profile?.gotra,
      caste: user?.profile?.caste,
      subCaste: user?.profile?.subCaste,
      manglikDosh: user?.profile?.manglikDosh,
      addressLine1: user?.profile?.addressLine1,
      addressLine2: user?.profile?.addressLine2,
      postOffice: user?.profile?.postOffice,
      policeStation: user?.profile?.policeStation,
      dist: user?.profile?.dist,
      state: user?.profile?.state,
      pinCode: user?.profile?.pinCode,
      whatsappNumber: user?.profile?.whatsappNumber,
      alternatePhone: user?.profile?.alternatePhone,
      height: user?.profile?.height,
      weight: user?.profile?.weight,
      bloodGroup: user?.profile?.bloodGroup,
      skinTone: user?.profile?.skinTone,
      bodyType: user?.profile?.bodyType,
      eatingHabits: user?.profile?.eatingHabits,
      drinkingHabits: user?.profile?.drinkingHabits,
      smokingHabits: user?.profile?.smokingHabits,
      profession: user?.profile?.profession,
      education: user?.profile?.education,
      hobbies: user?.profile?.hobbies,
      monthlyIncome: user?.profile?.monthlyIncome,
      language: user?.profile?.language,
      familyMembers: user?.profile?.familyMembers,
      fatherProfession: user?.profile?.fatherProfession,
      candidatePreference: user?.profile?.candidatePreference,
      locationPreference: user?.profile?.locationPreference,
      aboutMyself: user?.profile?.aboutMyself,
      aboutMyPartner: user?.profile?.aboutMyPartner,
    };

    res.status(200).json(new ApiResponse(200, "User found", formattedData));
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json(new ApiError(400, error.errors[0]?.message || ""));
    } else {
      res.status(500).json(new ApiError(500, "Internal server error"));
    }
  }
}

export async function updateGhotokUserProfile(req: Request, res: Response) {
  try {
    const data = await updateUserProfileSchema.parseAsync(req.body);
    const userId = req.params.userId;
    const currentUserId = req.systemUser?.id;

    if (!currentUserId) {
      return res.status(400).json(new ApiError(400, "Session not found"));
    }

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, isGhotokOwned: true, ghotokId: currentUserId },
      select: {
        gender: true,
      },
    });

    // Decide title based on gender + marital status
    const newTitle =
      user?.gender === Gender.MALE
        ? "Mr."
        : data.maritalStatus === "DIVORCED" || data.maritalStatus === "WIDOWED"
          ? "Ms."
          : "Miss";

    // Shared profile data (avoid repetition)
    const profileData = {
      dob: data.dob,
      maritalStatus: data.maritalStatus ?? "SINGLE",
      children: data.children,
      speciallyAble: data.speciallyAble,
      whatsappNumber: data.whatsappNumber ?? "",
      alternatePhone: data.alternatePhone,
      religion: data.religion,
      gotra: data.gotra,
      caste: data.caste,
      subCaste: data.subCaste,
      manglikDosh: data.manglik,
      height: data.height,
      weight: data.weight,
      bloodGroup: data.bloodGroup,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      postOffice: data.postOffice,
      policeStation: data.policeStation,
      dist: data.dist,
      state: data.state,
      pinCode: data.pinCode,
      skinTone: data.skinTone,
      bodyType: data.bodyType,
      eatingHabits: data.eatingHabits,
      drinkingHabits: data.drinkingHabits,
      smokingHabits: data.smokingHabits,
      profession: data.profession,
      education: data.education,
      hobbies: data.hobbies,
      monthlyIncome: data.monthlyIncome,
      language: data.languages,
      familyMembers: data.familyMembers,
      fatherProfession: data.fatherProfession,
      candidatePreference: data.candidatePreferences,
      locationPreference: data.locationPreferences,
      aboutMyself: data.aboutMyself,
      aboutMyPartner: data.aboutMyPartner,
    };

    await prisma.user.update({
      where: { id: userId },
      data: {
        // update only if provided
        ...(newTitle ? { title: newTitle } : {}),
        isProfileComplete: true,
        isProfilePublic: data.isProfilePublic,
        allowSocialPublish: data.allowSocialPublish,
        profile: {
          upsert: {
            create: { ...profileData },
            update: { ...profileData },
          },
        },
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Profile updated successfully", null));
  } catch (error) {
    console.log("Error in update profile", error);

    if (error instanceof ZodError) {
      return res
        .status(400)
        .json(new ApiError(400, error.errors[0]?.message as string));
    } else {
      return res.status(500).json(new ApiError(500, "Internal server error"));
    }
  }
}

export async function ghotokUserProfileStatusAndImages(
  req: Request,
  res: Response
) {
  try {
    const userId = req.params.userId;
    const currentUserId = req.systemUser?.id;

    if (!currentUserId) {
      return res.status(400).json(new ApiError(400, "Session not found"));
    }

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, isGhotokOwned: true, ghotokId: currentUserId },
      select: {
        isProfileComplete: true,
        avatar: true,
        profile: {
          select: {
            profileImages: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    return res.status(200).json(
      new ApiResponse(200, "User status and images", {
        avatar: user.avatar,
        isProfileComplete: user.isProfileComplete,
        profileImages: user.profile?.profileImages,
      })
    );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function updateGhotokUserProfileAvatar(
  req: Request,
  res: Response
) {
  try {
    const userId = req.params.userId;
    const file = req.file;
    const currentUserId = req.systemUser?.id;

    if (!currentUserId) {
      return res.status(400).json(new ApiError(400, "Session not found"));
    }

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }
    if (!file) {
      return res.status(400).json(new ApiError(400, "No file uploaded"));
    }

    const existingData = await prisma.user.findUnique({
      where: { id: userId, isGhotokOwned: true, ghotokId: currentUserId },
      select: { avatar: true },
    });

    if (existingData?.avatar) {
      await storageProvider.delete(existingData.avatar, "images/avatars");
    }

    // ✅ Use our storage abstraction instead of direct Cloudinary
    const url = await storageProvider.upload(file, "images/avatars");

    await prisma.user.update({
      where: { id: userId },
      data: {
        isProfileComplete: true,
        avatar: url,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Avatar updated successfully", url));
  } catch (error) {
    console.log("Error in update profile avatar", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function uploadGhotokUserProfileImages(
  req: Request,
  res: Response
) {
  try {
    const userId = req.params.userId;
    const files = req.files as Express.Multer.File[];
    const currentUserId = req.systemUser?.id;

    if (!currentUserId) {
      return res.status(400).json(new ApiError(400, "Session not found"));
    }

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }
    if (!files) {
      return res.status(400).json(new ApiError(400, "No file uploaded"));
    }

    const userProfile = await prisma.user.findUnique({
      where: {
        id: userId,
        isGhotokOwned: true,
        ghotokId: currentUserId,
      },
      select: {
        isProfileComplete: true,
        profile: {
          select: {
            id: true,
            _count: {
              select: {
                profileImages: true,
              },
            },
          },
        },
      },
    });

    if (!userProfile) {
      return res.status(404).json(new ApiError(404, "Profile not found"));
    }

    if (userProfile.isProfileComplete !== true) {
      return res
        .status(400)
        .json(new ApiError(400, "Please complete your profile first"));
    }

    const imageCount = userProfile.profile?._count.profileImages ?? 0;
    if (imageCount + files.length > 100) {
      return res
        .status(400)
        .json(new ApiError(400, "You can only upload up to 100 images"));
    }

    // ✅ Use our storage abstraction instead of direct Cloudinary
    const urls = await storageProvider.uploadMany(files, "images/profile");

    await prisma.profileImage.createMany({
      data: urls.map((url) => ({
        profileId: userProfile.profile?.id as string,
        url: url,
      })),
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Images uploaded successfully", urls));
  } catch (error) {
    console.log("Error in update profile avatar", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function deleteGhotokUserProfileImage(
  req: Request,
  res: Response
) {
  try {
    const userId = req.params.userId;
    const imageId = req.params.imageId;
    const currentUserId = req.systemUser?.id;

    if (!currentUserId) {
      return res.status(400).json(new ApiError(400, "Session not found"));
    }

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }
    if (!imageId) {
      return res.status(400).json(new ApiError(400, "No image id provided"));
    }
    // Fetch the user along with their profile and profile images
    const userWithProfile = await prisma.user.findUnique({
      where: { id: userId, isGhotokOwned: true, ghotokId: currentUserId },
      include: {
        profile: {
          include: {
            profileImages: true, // assuming this is the relation name
          },
        },
      },
    });

    // Check if user/profile exist
    if (!userWithProfile || !userWithProfile.profile) {
      return res
        .status(404)
        .json(new ApiError(404, "User or profile not found"));
    }

    // Find the image in the profileImages array
    const image = userWithProfile.profile.profileImages.find(
      (img) => img.id === imageId
    );

    if (!image) {
      return res.status(404).json(new ApiError(404, "Image not found"));
    }

    // Delete the image from Cloudinary
    await storageProvider.delete(image.url, "images/profile");

    // Delete the image from the database
    await prisma.profileImage.delete({ where: { id: imageId } });

    return res
      .status(200)
      .json(new ApiResponse(200, "Image deleted successfully", null));
  } catch (error) {
    console.log("Error in delete image", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function deactivateGhotokUserProfile(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const currentUserId = req.systemUser?.id;

    if (!currentUserId) {
      return res.status(400).json(new ApiError(400, "Session not found"));
    }

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    const deactiveProfile = await prisma.user.update({
      where: { id: userId, isGhotokOwned: true, ghotokId: currentUserId },
      data: {
        blocked: true,
      },
    });

    // Check if user/profile exist
    if (!deactiveProfile) {
      return res
        .status(404)
        .json(new ApiError(404, "User or profile not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Profile deactivated successfully", null));
  } catch (error) {
    console.log("Error in deactivate profile", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function activateGhotokUserProfile(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const currentUserId = req.systemUser?.id;

    if (!currentUserId) {
      return res.status(400).json(new ApiError(400, "Session not found"));
    }

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    const deactiveProfile = await prisma.user.update({
      where: { id: userId, isGhotokOwned: true, ghotokId: currentUserId },
      data: {
        blocked: false,
      },
    });

    // Check if user/profile exist
    if (!deactiveProfile) {
      return res
        .status(404)
        .json(new ApiError(404, "User or profile not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Profile activated successfully", null));
  } catch (error) {
    console.log("Error in deactivate profile", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getAllConnectionRequest(req: Request, res: Response) {
  try {
    const currentUserId = req.systemUser?.id;

    if (!currentUserId) {
      return res.status(400).json(new ApiError(400, "Session not found"));
    }

    //Get all connection requests
    const connectionRequest = await prisma.friendRequest.findMany({
      where: {
        status: "SENT",
        OR: [
          {
            receiver: {
              isGhotokOwned: true,
              ghotokId: currentUserId,
            },
          },
          {
            sender: {
              isGhotokOwned: true,
              ghotokId: currentUserId,
            },
          }
        ]
      },
      select: {
        id: true,
        sender: {
          select: {
            id: true,
            title: true,
            lastName: true,
            avatar: true,
            gender: true,
            isGhotokOwned: true,
          },
        },
        receiver: {
          select: {
            id: true,
            title: true,
            firstName: true,
            middleName: true,
            lastName: true,
            avatar: true,
            gender: true,
            isGhotokOwned: true,
          },
        },
        createdAt: true,
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Connection request fetched successfully",
          connectionRequest
        )
      );
  } catch (error) {
    console.log("Error while getting connection request", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function connectionRequestAcceptGhotok(
  req: Request,
  res: Response
) {
  try {
    const { requestId } = req.params;

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Update connection request
      const request = await tx.friendRequest.update({
        where: { id: requestId },
        data: { status: ConnectionStatus.ACCEPTED },
        include: { sender: true, receiver: true },
      });

      // 2️⃣ Check if conversation already exists
      let conversation = await tx.conversation.findFirst({
        where: {
          participants: {
            some: { id: request.senderId },
          },
          AND: {
            participants: {
              some: { id: request.receiverId },
            },
          },
        },
      });

      if (!conversation) {
        const newConversationId = await generateConversationId(tx);
        conversation = await tx.conversation.create({
          data: {
            convId: newConversationId,
            hasGhotokParticipant: true,
            participants: {
              connect: [{ id: request.senderId }, { id: request.receiverId }],
            },
          },
        });
      }
    });

    res
      .status(200)
      .json(new ApiResponse(200, "Connection request accepted", null));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, "Something went wrong"));
  }
}

export async function connectionRequestRejecGhotok(
  req: Request,
  res: Response
) {
  try {
    const { requestId } = req.params;

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: ConnectionStatus.REJECTED },
      include: { sender: true, receiver: true },
    });

    res
      .status(200)
      .json(new ApiResponse(200, "Connection request rejected.", null));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, "Something went wrong"));
  }
}

export async function getAllConversationOfGhotokUser(
  req: Request,
  res: Response
) {
  try {
    const currentUserId = req.systemUser?.id;

    if (!currentUserId) {
      return res.status(400).json(new ApiError(400, "Session not found"));
    }

    const conversation = await prisma.conversation.findMany({
      where: {
        hasGhotokParticipant: true,
        participants: {
          some: {
            ghotokId: currentUserId,
          },
        },
      },
      select: {
        id: true,
        convId: true,
        participants: {
          select: {
            id: true,
            title: true,
            firstName: true,
            middleName: true,
            lastName: true,
            avatar: true,
            gender: true,
            ghotokId: true,
          },
        },
        messages: {
          where: {
            moderation: {
              status: "APPROVED",
            },
          },
          select: {
            id: true,
            content: true,
            senderId: true,
            receiverId: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const formattedData = conversation.map((conversation) => ({
      id: conversation.id,
      convId: conversation.convId,
      participants: conversation.participants.map((participant) => ({
        id: participant?.id,
        title: participant?.title,
        ...(participant?.ghotokId === currentUserId && {
          firstName: participant?.firstName,
          middleName: participant?.middleName,
        }),
        lastName: participant?.lastName,
        avatar: participant?.avatar,
        gender: participant?.gender,
      })),
      lastMessage: conversation.messages[0],
    }));

    res
      .status(200)
      .json(new ApiResponse(200, "Conversation fetched", formattedData));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, "Something went wrong"));
  }
}

export async function createReportGhotokUser(req: Request, res: Response) {
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
      .json(new ApiResponse(200, "User reported successfully", reportGroom.id));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function allReportedGhotokUser(req: Request, res: Response) {
  try {
    const userId = req.systemUser?.id;
    // Get data from database
    const reportedBrides = await prisma.reportUserTeams.findMany({
      where: {
        reportedId: userId,
      },
      select: {
        id: true,
        reason: true,
        status: true,
        reply: true,
        user: {
          select: {
            id: true,
            publicId: true,
            title: true,
            lastName: true,
            gender: true,
            type: true,
            avatar: true,
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

export async function getSingleReportedGhotokUser(req: Request, res: Response) {
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

export async function getAllMatchingUsers(req: Request, res: Response) {
  try {
    const currentGhotokId = req.systemUser?.id;
    // Get data from database
    const matchingUsers = await prisma.superAdminUserConversation.findMany({
      where: {
        user: {
          ghotokId: currentGhotokId,
        },
      },
      select: {
        id: true,
        lastMessageAt: true,
        user: {
          select: {
            id: true,
            publicId: true,
            title: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            avatar: true,
            type: true,
          },
        },
        messages: {
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            type: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
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
          "Matching users fetched successfully",
          matchingUsers
        )
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getMatchingUserConversationDetailsById(
  req: Request,
  res: Response
) {
  try {
    const conversationId = req.params.conversationId;
    const currentGhotokId = req.systemUser?.id;
    // Get data from database
    const conversation = await prisma.superAdminUserConversation.findFirst({
      where: {
        id: conversationId,
      },
      select: {
        id: true,
        lastMessageAt: true,
        user: {
          select: {
            id: true,
          },
        },
        messages: {
          select: {
            id: true,
            conversationId: true,
            content: true,
            senderId: true,
            type: true,
            price: true,
            paymentPhase: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    const formattedData = {
      id: conversation?.id,
      lastMessageAt: conversation?.lastMessageAt,
      messages: conversation?.messages,
      userId: conversation?.user.id,
    };

    res
      .status(200)
      .json(new ApiResponse(200, "Conversation details", formattedData));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getMatchingPaymentRequestByMessageIdForGhotok(
  req: Request,
  res: Response
) {
  try {
    const messageId = req.params.messageId;

    if (!messageId)
      return res.status(400).json(new ApiError(400, "Message not found"));

    // Get payment from database
    const paymentDetails = await prisma.superAdminUserMessage.findFirst({
      where: { id: messageId, type: "PAYMENT" },
      select: {
        price: true,
        content: true,
        paymentPhase: true,
        conversation: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!paymentDetails)
      return res.status(404).json(new ApiError(404, "Payment not found"));

    const formattedData = {
      price: paymentDetails.price,
      content: paymentDetails.content,
      paymentPhase: paymentDetails.paymentPhase,
      userId: paymentDetails.conversation.userId,
    };

    return res.json(new ApiResponse(200, "Payments found", formattedData));
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function createMatchingPaymentForGhotok(
  req: Request,
  res: Response
) {
  try {
    const { userId, messageId, paymentName } = req.body;
    const sceenshotFile = req.file;

    if (!userId)
      return res.status(400).json(new ApiError(400, "User not found"));

    if (!messageId)
      return res.status(400).json(new ApiError(400, "Message not found"));

    if (!sceenshotFile)
      return res.status(400).json(new ApiError(400, "File not found"));

    if (!paymentName)
      return res.status(400).json(new ApiError(400, "Payment name not found"));

    // ✅ Use our storage abstraction instead of direct Cloudinary
    const url = await storageProvider.upload(sceenshotFile, "payment/matching");

    const message = await prisma.superAdminUserMessage.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        type: true,
        price: true,
      },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.type !== "PAYMENT") {
      throw new Error("Not a payment message");
    }

    const updatedMessage = await prisma.superAdminUserMessage.update({
      where: { id: messageId },
      data: {
        paymentPhase: "VERIFYING",

        matchingPayment: {
          create: {
            userId,
            amount: message.price!, // ✅ safely copied
            screenShotUrl: url,
            paymentName,
          },
        },
      },
      select: {
        matchingPaymentId: true,
      },
    });

    return res.json(
      new ApiResponse(
        200,
        "Matching Payments Success",
        updatedMessage.matchingPaymentId
      )
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getMatchingPaymentDetailsByMessageIdForGhotok(
  req: Request,
  res: Response
) {
  try {
    const messageId = req.params.messageId;

    if (!messageId)
      return res.status(400).json(new ApiError(400, "Message not found"));

    // Get payment from database
    const paymentDetails = await prisma.matchingPayment.findFirst({
      where: {
        message: {
          id: messageId,
        },
      },
      select: {
        id: true,
        amount: true,
        screenShotUrl: true,
        paymentName: true,
        status: true,
        feedback: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!paymentDetails)
      return res.status(404).json(new ApiError(404, "Payment not found"));

    return res.json(new ApiResponse(200, "Payments found", paymentDetails));
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getAllPaidMatchedGroomsForGhotok(
  req: Request,
  res: Response
) {
  try {
    const ghotokUserId = req.systemUser?.id!;

    if (!ghotokUserId) {
      return res.status(400).json(new ApiError(400, "Session not found"));
    }

    const grooms = await prisma.user.findMany({
      where: {
        gender: "MALE",
        hasMatched: true,
        isGhotokOwned: true,
        ghotokId: ghotokUserId,
      },
      select: {
        id: true,
        title: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        avatar: true,
        type: true,
        isGhotokOwned: true,
        matchingStartDate: true,
        matchingExpiryDate: true,
      },
    });

    const formattedGrooms = grooms.map((groom) => ({
      ...groom,
      matchingStartDate: groom.matchingStartDate || null,
      matchingExpiryDate: groom.matchingExpiryDate || null,
      isExipired: groom.matchingExpiryDate < new Date(),
    }));

    return res.json(new ApiResponse(200, "Payments found", formattedGrooms));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getAllGhotokBridesForChat(req: Request, res: Response) {
  try {
    const currentUserId = req.systemUser?.id;
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

    const [users, totalData] = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          isGhotokOwned: true,
          ghotokId: currentUserId,
          gender: Gender.FEMALE,
          conversations: {
            some: {},
          },
        },
        select: {
          id: true,
          publicId: true,
          title: true,
          firstName: true,
          middleName: true,
          lastName: true,
          gender: true,
          avatar: true,
        },

        skip,
        take: limitNum,
      }),
      prisma.user.count({
        where: {
          isGhotokOwned: true,
          ghotokId: currentUserId,
          gender: Gender.FEMALE,
          conversations: {
            some: {},
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalData / limitNum);

    return res.status(200).json(
      new ApiResponse(200, "Success", {
        totalData,
        totalPages,
        currentPage: pageNum,
        pageSize: limitNum,
        data: users,
      })
    );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getAllConversationByGhotokBrideIdForChat(
  req: Request,
  res: Response
) {
  try {
    const currentUserId = req.systemUser?.id;
    const brideId = req.params.brideId;
    let { page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (!brideId) {
      return res.status(400).json(new ApiError(400, "Bride id not found"));
    }

    if (!currentUserId) {
      return res.status(400).json(new ApiError(400, "Session not found"));
    }

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json(new ApiError(400, "Invalid page number"));
    }
    if (isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json(new ApiError(400, "Invalid limit number"));
    }

    const skip = (pageNum - 1) * limitNum;

    const [conversations, totalData] = await prisma.$transaction([
      prisma.conversation.findMany({
        where: {
          hasGhotokParticipant: true,
          participants: {
            some: {
              id: brideId,
              ghotokId: currentUserId,
            },
          },
        },
        select: {
          id: true,
          convId: true,
          participants: {
            select: {
              id: true,
              publicId: true,
              title: true,
              lastName: true,
              gender: true,
              avatar: true,
            },
            where: {
              NOT: {
                id: brideId,
              },
            },
            take: 1,
          },
        },

        skip,
        take: limitNum,
      }),
      prisma.conversation.count({
        where: {
          hasGhotokParticipant: true,
          participants: {
            some: {
              id: brideId,
              ghotokId: currentUserId,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalData / limitNum);
    const data = conversations.map((item) => ({
      ...item,
      participants: item.participants[0],
    }));

    return res.status(200).json(
      new ApiResponse(200, "Success", {
        totalData,
        totalPages,
        currentPage: pageNum,
        pageSize: limitNum,
        data,
      })
    );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getAllGhotokGroomsForChat(req: Request, res: Response) {
  try {
    const currentUserId = req.systemUser?.id;
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

    const [users, totalData] = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          isGhotokOwned: true,
          ghotokId: currentUserId,
          gender: Gender.MALE,
          conversations: {
            some: {},
          },
        },
        select: {
          id: true,
          publicId: true,
          title: true,
          firstName: true,
          middleName: true,
          lastName: true,
          gender: true,
          avatar: true,
        },

        skip,
        take: limitNum,
      }),
      prisma.user.count({
        where: {
          isGhotokOwned: true,
          ghotokId: currentUserId,
          gender: Gender.MALE,
          conversations: {
            some: {},
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalData / limitNum);

    return res.status(200).json(
      new ApiResponse(200, "Success", {
        totalData,
        totalPages,
        currentPage: pageNum,
        pageSize: limitNum,
        data: users,
      })
    );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getAllConversationByGhotokGroomIdForChat(
  req: Request,
  res: Response
) {
  try {
    const currentUserId = req.systemUser?.id;
    const groomId = req.params.groomId;
    let { page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (!groomId) {
      return res.status(400).json(new ApiError(400, "Bride id not found"));
    }

    if (!currentUserId) {
      return res.status(400).json(new ApiError(400, "Session not found"));
    }

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json(new ApiError(400, "Invalid page number"));
    }
    if (isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json(new ApiError(400, "Invalid limit number"));
    }

    const skip = (pageNum - 1) * limitNum;

    const [conversations, totalData] = await prisma.$transaction([
      prisma.conversation.findMany({
        where: {
          hasGhotokParticipant: true,
          participants: {
            some: {
              id: groomId,
              ghotokId: currentUserId,
            },
          },
        },
        select: {
          id: true,
          convId: true,
          participants: {
            select: {
              id: true,
              publicId: true,
              title: true,
              lastName: true,
              gender: true,
              avatar: true,
            },
            where: {
              NOT: {
                id: groomId,
              },
            },
            take: 1,
          },
        },

        skip,
        take: limitNum,
      }),
      prisma.conversation.count({
        where: {
          hasGhotokParticipant: true,
          participants: {
            some: {
              id: groomId,
              ghotokId: currentUserId,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalData / limitNum);
    const data = conversations.map((item) => ({
      ...item,
      participants: item.participants[0],
    }));

    return res.status(200).json(
      new ApiResponse(200, "Success", {
        totalData,
        totalPages,
        currentPage: pageNum,
        pageSize: limitNum,
        data,
      })
    );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getBrideUserIdByProfileIdForGhotok(
  req: Request,
  res: Response
) {
  try {
    const { publicId } = req.params;

    if (!publicId)
      return res.status(400).json(new ApiError(400, "Public id not found"));

    const bride = await prisma.user.findUnique({
      where: { publicId, gender: "FEMALE" },
      select: {
        id: true,
      },
    });

    if (!bride)
      return res.status(400).json(new ApiError(400, "Bride not found"));

    return res.status(200).json(new ApiResponse(200, "Bride found", bride.id));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}


export async function ghotokHomeBrides(req: Request, res: Response) {
  try {
    let { page = "1", limit = "10" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, totalData] = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          gender: Gender.FEMALE,
          isProfilePublic: true,
          isGhotokOwned: false,
        },
        select: {
          id: true, publicId: true, title: true, firstName: true, lastName: true, gender: true, avatar: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: { gender: Gender.FEMALE, isProfilePublic: true, isGhotokOwned: false } }),
    ]);

    const totalPages = Math.ceil(totalData / limitNum);
    return res.status(200).json(new ApiResponse(200, "Success", { totalData, totalPages, currentPage: pageNum, pageSize: limitNum, data: users }));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function ghotokHomeGrooms(req: Request, res: Response) {
  try {
    let { page = "1", limit = "10" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, totalData] = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          gender: Gender.MALE,
          isProfilePublic: true,
          isGhotokOwned: false,
        },
        select: {
          id: true, publicId: true, title: true, firstName: true, lastName: true, gender: true, avatar: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: { gender: Gender.MALE, isProfilePublic: true, isGhotokOwned: false } }),
    ]);

    const totalPages = Math.ceil(totalData / limitNum);
    return res.status(200).json(new ApiResponse(200, "Success", { totalData, totalPages, currentPage: pageNum, pageSize: limitNum, data: users }));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}


export async function ghotokSendConnectionRequest(req: Request, res: Response) {
  try {
    const currentUserId = req.systemUser?.id;
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json(new ApiError(400, "Sender and receiver IDs are required"));
    }

    // Verify the sender is owned by the current Ghotok
    const sender = await prisma.user.findFirst({
      where: {
        id: senderId,
        isGhotokOwned: true,
        ghotokId: currentUserId,
      }
    });

    if (!sender) {
      return res.status(403).json(new ApiError(403, "You do not own the sender user"));
    }

    // Check if a request already exists
    const existRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId },
        ]
      }
    });

    if (existRequest) {
      return res.status(400).json(new ApiError(400, "Connection request already exists"));
    }

    // Create request
    const request = await prisma.friendRequest.create({
      data: {
        senderId: senderId,
        receiverId: receiverId,
        status: ConnectionStatus.SENT,
      }
    });

    return res.status(200).json(new ApiResponse(200, "Connection request sent successfully", request));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}
