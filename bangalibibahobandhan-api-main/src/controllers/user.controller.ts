import e, { Request, Response } from "express";
import { calculateAge, getPagination } from "../utils/pagination.js";
import { prisma } from "../config/db.js";
import ApiResponse from "../utils/ApiResponse.js";
import { UserType } from "../types/user-type.js";
import { ZodError } from "zod";
import ApiError from "../utils/ApiError.js";
import { updateUserProfileSchema } from "../schema/userSchema.js";
import { ConnectionStatus } from "../utils/enum/ConnectionStatus.js";
import { MessageStatus } from "../utils/enum/MessageStatus.js";
import { MESSAGE_RECEIVE, MESSAGE_STATUS_UPDATE } from "../utils/constant.js";
import storageProvider from "../services/storage/StorageProvide.js";
import { Gender } from "../types/gender.js";
import { FriendRequestStatus, Prisma } from "@prisma/client";
import { RedisService } from "../services/RedisService.js";
import { Role } from "../types/roles.js";
import { addIdPrefix } from "../utils/formatTeamID.js";
import { ChatValidationService } from "../utils/ChatValidationService.js";
import { UserTeamConversationType } from "../utils/enum/UserTeamConversationType.js";
import { generateConversationId } from "../utils/generateConversationID.js";
import { authUser } from "../utils/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { changeContactDetailsSchema } from "../schema/authSchema.js";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";

const redisService = new RedisService();

export async function isUserSessionActive(req: Request, res: Response) {
  try {
    const session = await authUser.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    res.json(
      new ApiResponse(200, "Users fetched successfully", {
        session: !!session?.session,
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const currentUser = req.user;

    // Pagination params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { take, skip } = getPagination(page, limit);

    const isCurrentUserMale = currentUser?.gender === "MALE";
    const targetGender = isCurrentUserMale ? "FEMALE" : "MALE";

    // Run conversation + blocked queries in a single transaction
    const [conversations, blockedRelations, interestsSent, interestsReceived] =
      await prisma.$transaction([
        prisma.conversation.findMany({
          where: {
            participants: {
              some: { id: currentUser.id },
            },
          },
          select: {
            participants: { select: { id: true } },
          },
        }),
        prisma.blockedUser.findMany({
          where: {
            OR: [{ blockerId: currentUser.id }, { blockedId: currentUser.id }],
          },
          select: { blockerId: true, blockedId: true },
        }),
        // 🔥 who *I* sent interest to
        prisma.friendRequest.findMany({
          where: { senderId: currentUser.id, status: FriendRequestStatus.SENT },
          select: { receiverId: true },
        }),

        // 🔥 who sent *me* interest
        prisma.friendRequest.findMany({
          where: {
            receiverId: currentUser.id,
            status: FriendRequestStatus.SENT,
          },
          select: { senderId: true },
        }),
      ]);

    // Extract excluded IDs
    const excludedConversationUserIds = conversations
      .flatMap((c) => c.participants.map((p) => p.id))
      .filter((id) => id !== currentUser.id);

    const excludedBlockedUserIds = blockedRelations.map((b) =>
      b.blockerId === currentUser.id ? b.blockedId : b.blockerId
    );

    const excludedUserIds = [
      ...new Set([...excludedConversationUserIds, ...excludedBlockedUserIds]),
    ];

    // Filter parameters
    const minAge = parseInt(req.query.minAge as string);
    const maxAge = parseInt(req.query.maxAge as string);
    const location = req.query.location as string;
    const religion = req.query.religion as string;
    const maritalStatus = req.query.maritalStatus as string;
    const education = req.query.education as string;
    const profession = req.query.profession as string;
    const caste = req.query.caste as string;
    const subCaste = req.query.subCaste as string;
    const eatingHabits = req.query.eatingHabits as string;
    const drinkingHabits = req.query.drinkingHabits as string;
    const smokingHabits = req.query.smokingHabits as string;
    const name = req.query.name as string;

    // Build filter
    const userFilter: any = {
      gender: targetGender,
      isProfileComplete: true,
      verificationStatus: "APPROVED",
      id: { notIn: [currentUser.id, ...excludedUserIds] },
    };

    if (name) {
      userFilter.OR = [
        { title: { contains: name } },
        { lastName: { contains: name } },
        { publicId: { contains: name } }
      ];
    }

    if (minAge || maxAge) {
      const today = new Date();
      const maxDate = minAge ? new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate()) : undefined;
      const minDate = maxAge ? new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate()) : undefined;
      
      userFilter.profile = {
        ...userFilter.profile,
        dob: {
          ...(maxDate && { lte: maxDate }),
          ...(minDate && { gt: minDate }),
        }
      }
    }
    
    if (location) {
      userFilter.profile = {
        ...userFilter.profile,
        dist: { contains: location }
      }
    }
    
    if (religion) {
      userFilter.profile = {
        ...userFilter.profile,
        religion: religion
      }
    }

    if (maritalStatus) {
      userFilter.profile = {
        ...userFilter.profile,
        maritalStatus: maritalStatus
      }
    }

    if (education) {
      userFilter.profile = {
        ...userFilter.profile,
        education: { contains: education }
      }
    }

    if (profession) {
      userFilter.profile = {
        ...userFilter.profile,
        profession: { contains: profession }
      }
    }

    if (caste) {
      userFilter.profile = {
        ...userFilter.profile,
        caste: { contains: caste }
      }
    }

    if (subCaste) {
      userFilter.profile = {
        ...userFilter.profile,
        subCaste: { contains: subCaste }
      }
    }

    if (eatingHabits) {
      userFilter.profile = {
        ...userFilter.profile,
        eatingHabits: eatingHabits
      }
    }

    if (drinkingHabits) {
      userFilter.profile = {
        ...userFilter.profile,
        drinkingHabits: drinkingHabits
      }
    }

    if (smokingHabits) {
      userFilter.profile = {
        ...userFilter.profile,
        smokingHabits: smokingHabits
      }
    }

    // Now fetch users + count in the same transaction
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where: userFilter,
        select: {
          id: true,
          publicId: true,
          title: true,
          lastName: true,
          gender: true,
          type: true,
          avatar: true,
          isGhotokOwned: true,
          profile: {
            select: {
              dob: true,
              dist: true,
              state: true,
              height: true,
              education: true,
              profession: true,
              subCaste: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: userFilter }),
    ]);

    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const isOnline = await redisService.isUserOnline(user.id);
        const lastSeen = await redisService.getUserLastSeen(user.id);
        let status: string;

        if (isOnline) {
          status = "Online";
        } else if (lastSeen) {
          const minutesAgo = differenceInMinutes(new Date(), lastSeen);
          if (minutesAgo <= 2) {
            status = "Online";
          } else {
            status = `Last seen ${formatDistanceToNow(lastSeen, { addSuffix: true })}`;
          }
        } else {
          status = "Offline";
        }

        return {
          ...user,
          profile: {
            ...user.profile,
            age: user.profile?.dob ? calculateAge(user.profile.dob) : null,
            dob: undefined,
          },
          status,
          isInterestSent: interestsSent.some((i) => i.receiverId === user.id),
          isInterestReceived: interestsReceived.some((i) => i.senderId === user.id),
        };
      })
    );

    res.json(
      new ApiResponse(200, "Users fetched successfully", {
        page,
        total: Math.ceil(total / take),
        totalData: total,
        data: usersWithStatus,
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const requestedUserId = req.params.id;
    const currentUser = req.user!;

    // Get target user
    const [
      targetUser,
      youRequestSent,
      youRequestReceived,
      youBlockUser,
      youBlockedByUser,
      bothAreFriends,
    ] = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: requestedUserId },
        select: {
          id: true,
          publicId: true,
          title: true,
          lastName: true,
          gender: true,
          avatar: true,
          email: true,
          phone: true,
          isGhotokOwned: true,
          verificationStatus: true,
          ghotokId: true,
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
              skinTone: true,
              bodyType: true,
              eatingHabits: true,
              drinkingHabits: true,
              smokingHabits: true,
              dist: true,
              state: true,
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
              rashi: true,
              nakshatra: true,
              birthTime: true,
              cityOfBirth: true,
              countryOfBirth: true,
            },
          },
        },
      });

      const youBlockUser = await tx.blockedUser.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: currentUser.id,
            blockedId: requestedUserId as string,
          },
        },
      });

      const youBlockedByUser = await tx.blockedUser.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: requestedUserId as string,
            blockedId: currentUser.id,
          },
        },
      });

      const youRequestSent = currentUser?.id
        ? await tx.friendRequest.findFirst({
            where: {
              senderId: currentUser.id,
              receiverId: requestedUserId as string,
              status: ConnectionStatus.SENT,
            },
          })
        : null;

      const youRequestReceived = currentUser?.id
        ? await tx.friendRequest.findFirst({
            where: {
              senderId: requestedUserId as string,
              receiverId: currentUser.id,
              status: ConnectionStatus.SENT,
            },
          })
        : null;

      const bothAreFriends = currentUser?.id
        ? await tx.conversation.findFirst({
            where: {
              AND: [
                { participants: { some: { id: currentUser.id } } },
                { participants: { some: { id: requestedUserId as string } } },
              ],
            },
          })
        : null;

      return [
        user,
        youRequestSent,
        youRequestReceived,
        youBlockUser,
        youBlockedByUser,
        bothAreFriends,
      ] as const;
    });

    if (!targetUser) {
      return res.status(404).json(new ApiResponse(404, "User not found", null));
    }

    if (youBlockedByUser) {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            "You are blocked by this user. You can't view their profile",
            null
          )
        );
    }

    //Calculate Age
    const dob = targetUser?.profile?.dob ?? new Date(0);
    const age = new Date().getFullYear() - new Date(dob).getFullYear();

    const isOnline = await redisService.isUserOnline(targetUser.id);
    const lastSeen = await redisService.getUserLastSeen(targetUser.id);
    let status: string;

    if (isOnline) {
      status = "Online";
    } else if (lastSeen) {
      const minutesAgo = differenceInMinutes(new Date(), lastSeen);
      if (minutesAgo <= 2) {
        status = "Online";
      } else {
        status = `Last seen ${formatDistanceToNow(lastSeen, { addSuffix: true })}`;
      }
    } else {
      status = "Offline";
    }

    // Prepare data based on viewer type
    const basicInfo = {
      id: targetUser.id,
      publicId: targetUser.publicId,
      age: age,
      title: targetUser.title,
      lastName: targetUser.lastName,
      gender: targetUser.gender,
      avatar: targetUser?.avatar,
      profileImages: targetUser.profile?.profileImages,
      maritalStatus: targetUser.profile?.maritalStatus,
      religion: targetUser.profile?.religion,
      gotra: targetUser.profile?.gotra,
      caste: targetUser.profile?.caste,
      subCaste: targetUser.profile?.subCaste,
      manglikDosh: targetUser.profile?.manglikDosh,
      language: targetUser.profile?.language,
      dist: targetUser.profile?.dist,
      state: targetUser.profile?.state,
      alreadySentRequest: !!youRequestSent,
      receivedRequestId: youRequestReceived?.id,
      receivedRequestStatus: youRequestReceived?.status,
      alreadyBlocked: !!youBlockUser,
      alreadyFriend: !!bothAreFriends,
      phone: !!bothAreFriends ? targetUser.phone : null,
      email: !!bothAreFriends ? targetUser.email : null,
      status,
      verificationStatus: targetUser.verificationStatus,
      height: targetUser.profile?.height,
      education: targetUser.profile?.education,
      profession: targetUser.profile?.profession,
      aboutMyself: targetUser.profile?.aboutMyself,
      eatingHabits: targetUser.profile?.eatingHabits,
      drinkingHabits: targetUser.profile?.drinkingHabits,
      smokingHabits: targetUser.profile?.smokingHabits,
      aboutMyPartner: targetUser.profile?.aboutMyPartner,
      rashi: targetUser.profile?.rashi,
      nakshatra: targetUser.profile?.nakshatra,
      birthTime: targetUser.profile?.birthTime,
      cityOfBirth: targetUser.profile?.cityOfBirth,
      countryOfBirth: targetUser.profile?.countryOfBirth,
    };

    const fullInfo = {
      ...basicInfo,
      profileImages: targetUser.profile?.profileImages,
      children: targetUser.profile?.children,
      speciallyAble: targetUser.profile?.speciallyAble,
      weight: targetUser.profile?.weight,
      bloodGroup: targetUser.profile?.bloodGroup,
      skinTone: targetUser.profile?.skinTone,
      hobbies: targetUser.profile?.hobbies,
      monthlyIncome: targetUser.profile?.monthlyIncome,
      familyMembers: targetUser.profile?.familyMembers,
      fatherProfession: targetUser.profile?.fatherProfession,
      candidatePreference: targetUser.profile?.candidatePreference,
      locationPreference: targetUser.profile?.locationPreference,

      isGhotokOwned: targetUser.isGhotokOwned,
      ghotokPublicId: targetUser.ghotok?.ghotokPublicId,
    };

    const finalData =
      currentUser?.type === UserType.PAID_USER &&
      new Date(currentUser.planExpiryDate) > new Date()
        ? fullInfo
        : basicInfo;

    res.json(new ApiResponse(200, "User fetched successfully", finalData));
  } catch (err) {
    console.error(err);
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getSelfDetails(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        allowSocialPublish: true,
        isProfilePublic: true,
        verificationStatus: true,
        profile: {
          select: {
            dob: true,
            maritalStatus: true,
            children: true,
            bloodGroup: true,
            religion: true,
            gotra: true,
            caste: true,
            subCaste: true,
            manglikDosh: true,
            speciallyAble: true,
            height: true,
            weight: true,
            skinTone: true,
            bodyType: true,
            eatingHabits: true,
            drinkingHabits: true,
            smokingHabits: true,
            addressLine1: true,
            addressLine2: true,
            postOffice: true,
            policeStation: true,
            dist: true,
            state: true,
            pinCode: true,
            whatsappNumber: true,
            alternatePhone: true,
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
            rashi: true,
            nakshatra: true,
            birthTime: true,
            cityOfBirth: true,
            countryOfBirth: true,
          },
        },
      },
    });

    const formattedData = {
      isProfilePublic: user?.isProfilePublic,
      allowSocialPublish: user?.allowSocialPublish,
      verificationStatus: user?.verificationStatus,
      ...user?.profile,
    };

    res.json(new ApiResponse(200, "User fetched successfully", formattedData));
  } catch (err) {
    console.error(err);
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const data = await updateUserProfileSchema.parseAsync(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    // Decide title based on gender + marital status
    const newTitle =
      req.user.gender === Gender.MALE
        ? "Mr."
        : data.maritalStatus === "DIVORCED" || data.maritalStatus === "WIDOWED"
          ? "Ms."
          : "Miss";

    // Shared profile data (avoid repetition)
    const profileData = {
      dob: data.dob,
      maritalStatus: data.maritalStatus ?? "SINGLE",
      children: data.children,
      bloodGroup: data.bloodGroup,
      religion: data.religion,
      gotra: data.gotra,
      caste: data.caste,
      subCaste: data.subCaste,
      manglikDosh: data.manglik,
      speciallyAble: data.speciallyAble,
      height: data.height,
      weight: data.weight,
      skinTone: data.skinTone,
      bodyType: data.bodyType,
      eatingHabits: data.eatingHabits,
      drinkingHabits: data.drinkingHabits,
      smokingHabits: data.smokingHabits,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      postOffice: data.postOffice,
      policeStation: data.policeStation,
      dist: data.dist,
      state: data.state,
      pinCode: data.pinCode,
      whatsappNumber: data.whatsappNumber ?? "",
      alternatePhone: data.alternatePhone,
      aboutMyself: data.aboutMyself,
      profession: data.profession,
      education: data.education,
      hobbies: data.hobbies,
      monthlyIncome: data.monthlyIncome,
      language: data.languages,
      familyMembers: data.familyMembers,
      fatherProfession: data.fatherProfession,
      candidatePreference: data.candidatePreferences,
      locationPreference: data.locationPreferences,
      aboutMyPartner: data.aboutMyPartner,
      rashi: data.rashi,
      nakshatra: data.nakshatra,
      birthTime: data.timeOfBirth,
      cityOfBirth: data.cityOfBirth,
      countryOfBirth: data.countryOfBirth,
      
      familyType: data.familyType,
      mothersOccupation: data.mothersOccupation,
      noOfBrothers: data.noOfBrothers,
      noOfSisters: data.noOfSisters,
      familyValues: data.familyValues,
      
      workExperience: data.workExperience,
      collegeInstitution: data.collegeInstitution,
      fieldOfStudy: data.fieldOfStudy,
      passingYear: data.passingYear,
      organizationName: data.organizationName,
      
      partnerAgeRange: data.partnerAgeRange,
      partnerHeightRange: data.partnerHeightRange,
      partnerMaritalStatus: data.partnerMaritalStatus,
      partnerReligion: data.partnerReligion,
      partnerCaste: data.partnerCaste,
      partnerEducation: data.partnerEducation,
      partnerProfession: data.partnerProfession,
      partnerIncome: data.partnerIncome,
      partnerLocation: data.partnerLocation,
      partnerDiet: data.partnerDiet,
      partnerComplexion: data.partnerComplexion,
      partnerMotherTongue: data.partnerMotherTongue,

      // Additional Missing Fields
      disabilityDetails: data.disabilityDetails,
      healthScreening: data.healthScreening,
      country: data.country,
      citizenship: data.citizenship,
      ancestralOrigin: data.ancestralOrigin,
      relationshipWithBrideGroom: data.relationshipWithBrideGroom,

      personalityTraits: data.personalityTraits,
      lifeGoals: data.lifeGoals,
      employmentType: data.employmentType,
      occupationDetails: data.occupationDetails,
      designation: data.designation,
      companyName: data.companyName,

      brothersMarriedCount: data.brothersMarriedCount,
      sistersMarriedCount: data.sistersMarriedCount,
      myFamilyStatus: data.myFamilyStatus,
      familyDescription: data.familyDescription,
      familyBackground: data.familyBackground,
      culturalValues: data.culturalValues,

      partnerWeightRange: data.partnerWeightRange,
      partnerSpokenLanguages: data.partnerSpokenLanguages,
      partnerEmploymentType: data.partnerEmploymentType,
      partnerSubCaste: data.partnerSubCaste,
      partnerGothra: data.partnerGothra,
      partnerPreferredCountry: data.partnerPreferredCountry,
      partnerPreferredState: data.partnerPreferredState,
      partnerPreferredDistrict: data.partnerPreferredDistrict,
      partnerDrinkingHabit: data.partnerDrinkingHabit,
      partnerSmokingHabit: data.partnerSmokingHabit,
      partnerDisabilityAcceptable: data.partnerDisabilityAcceptable,
      partnerDescription: data.partnerDescription,
      partnerPersonalityExpectation: data.partnerPersonalityExpectation,
      partnerFamilyExpectation: data.partnerFamilyExpectation,
      partnerFamilyDetails: data.partnerFamilyDetails,
      familyStatusPreference: data.familyStatusPreference,
      familyTypePreference: data.familyTypePreference,
      familyValuesPreference: data.familyValuesPreference,
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

export async function updateProfileAvatar(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }
    if (!file) {
      return res.status(400).json(new ApiError(400, "No file uploaded"));
    }

    const existingData = await prisma.user.findUnique({
      where: { id: userId },
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

export async function updateProfileSelfie(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }
    if (!file) {
      return res.status(400).json(new ApiError(400, "No file uploaded"));
    }

    const existingData = await prisma.user.findUnique({
      where: { id: userId },
      select: { verificationSelfieUrl: true },
    });

    if (existingData?.verificationSelfieUrl) {
      await storageProvider.delete(existingData.verificationSelfieUrl, "images/selfies");
    }

    const url = await storageProvider.upload(file, "images/selfies");

    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationSelfieUrl: url,
        // Since they just uploaded it, it's pending review
        verificationStatus: "PENDING",
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Selfie uploaded successfully", url));
  } catch (error) {
    console.log("Error in update profile selfie", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getAllImages(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    const userProfile = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        isProfileComplete: true,
        profile: {
          select: {
            id: true,
            profileImages: true,
          },
        },
      },
    });

    if (!userProfile) {
      return res.status(404).json(new ApiError(404, "Profile not found"));
    }

    return res.status(200).json(
      new ApiResponse(200, "Fetched all Images", {
        isProfileComplete: userProfile.isProfileComplete,
        profileImages: userProfile.profile?.profileImages,
      })
    );
  } catch (error) {
    console.log("Error in get all images", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function uploadImages(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const files = req.files as Express.Multer.File[];

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }
    if (!files) {
      return res.status(400).json(new ApiError(400, "No file uploaded"));
    }

    const userProfile = await prisma.user.findUnique({
      where: {
        id: userId,
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

export async function deleteImage(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const imageId = req.params.imageId;

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }
    if (!imageId) {
      return res.status(400).json(new ApiError(400, "No image id provided"));
    }
    // Fetch the user along with their profile and profile images
    const userWithProfile = await prisma.user.findUnique({
      where: { id: userId },
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

export async function changeContactDetails(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(400).json(new ApiError(400, "User not found"));

    const { phone, email } = await changeContactDetailsSchema.parseAsync(
      req.body
    );

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json(new ApiError(404, "User not found"));

    // Skip if both unchanged
    if (user.phone === phone && user.email === email)
      return res
        .status(400)
        .json(new ApiError(400, "Contact details are already up to date"));

    // ========== EMAIL CHECK ==========
    if (email && email !== user.email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email },
      });
      if (existingEmail && existingEmail.id !== userId)
        return res
          .status(400)
          .json(new ApiError(400, "Email is already in use"));
    }

    // ========== PHONE CHECK ==========
    if (phone && phone !== user.phone) {
      const usernameCheck = await authUser.api.isUsernameAvailable({
        body: { username: phone },
      });

      if (!usernameCheck?.available)
        return res
          .status(400)
          .json(new ApiError(400, "Phone number is already in use"));
    }

    // ========== UPDATE DATA ==========
    const updateData: any = {};
    if (email && email !== user.email) updateData.email = email;
    if (phone && phone !== user.phone) {
      updateData.phone = phone;
      updateData.username = phone;
      updateData.displayUsername = phone;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Contact details updated successfully", null));
  } catch (error) {
    console.error("Error in changeContactDetails:", error);

    if (error instanceof ZodError)
      return res
        .status(400)
        .json(new ApiError(400, error.errors[0]?.message || "Invalid input"));

    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function isProfileCompleted(req: Request, res: Response) {
  try {
    const currentUserId = req.user?.id;

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        isProfileComplete: true,
        verificationStatus: true,
      },
    });

    if (!targetUser)
      return res.status(400).json(new ApiResponse(400, "User not found", null));

    res.json(
      new ApiResponse(
        200,
        "Profile completion status",
        {
          isProfileComplete: targetUser.isProfileComplete,
          verificationStatus: targetUser.verificationStatus,
        }
      )
    );
  } catch (err) {
    console.error(err);
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getAllSubscriptionPayment(req: Request, res: Response) {
  try {
    const currentUserId = req.user?.id;

    // Get target user
    const targetUser = await prisma.payment.findMany({
      where: { userId: currentUserId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        paymentType: true,
        plan: {
          select: {
            title: true,
            price: true,
          },
        },
      },
    });

    const formattedData = targetUser.map((payment) => ({
      id: payment.id,
      status: payment.status,
      createdAt: payment.createdAt,
      paymentType: payment.paymentType,
      planTitle: payment.plan.title,
      planPrice: payment.plan.price,
    }));

    res.json(
      new ApiResponse(
        200,
        "Payment history fetched successfully",
        formattedData
      )
    );
  } catch (err) {
    console.error(err);
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getPlans(req: Request, res: Response) {
  try {
    // Check if free plan exists, create if not
    const freePlan = await prisma.plan.findFirst({
      where: { price: "0" },
    });

    if (!freePlan) {
      await prisma.plan.create({
        data: {
          title: "FREE Plan",
          price: "0",
          duration: "15",
          connection: "0",
          status: true,
        },
      });
    }

    // Get plans from database
    const plans = await prisma.plan.findMany({
      where: { status: true },
      include: {
        discounts: {
          where: { isActive: true },
        },
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Plans fetched successfully", plans));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getPlanById(req: Request, res: Response) {
  try {
    const planId = req.params.id;
    // Get plans from database
    const plan = await prisma.plan.findFirst({
      where: { id: planId },
      include: {
        discounts: {
          where: { isActive: true },
        },
      },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "Plan fetched successfully", plan));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function claimDiscountedPlan(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { planId, couponCode } = req.body;

    if (!userId) return res.status(401).json(new ApiError(401, "Unauthorized"));
    if (!planId) return res.status(400).json(new ApiError(400, "Plan ID is required"));

    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { type: true, planExpiryDate: true, totalLimit: true, remainingLimit: true } 
    });
    if (!user) return res.status(404).json(new ApiError(404, "User not found"));

    // Fetch Plan with active discounts
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        discounts: {
          where: { isActive: true },
          orderBy: { percentage: "desc" },
          take: 1
        }
      }
    });

    if (!plan) return res.status(404).json(new ApiError(404, "Plan not found"));

    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await (prisma as any).coupon.findFirst({
        where: { code: couponCode, planId: plan.id, isActive: true }
      });
      if (coupon) couponDiscount = coupon.percentage;
    }

    const activeDiscount = plan.discounts && plan.discounts.length > 0 ? plan.discounts[0]?.percentage ?? 0 : 0;
    const rawPrice = Number(plan.price);
    const baseDiscountedPrice = activeDiscount ? Math.round(rawPrice - (rawPrice * activeDiscount) / 100) : rawPrice;
    const finalPrice = couponDiscount ? Math.round(baseDiscountedPrice - (baseDiscountedPrice * couponDiscount) / 100) : baseDiscountedPrice;

    if (finalPrice > 0) {
      return res.status(400).json(new ApiError(400, "This plan is not free. A valid 100% discount combination is required."));
    }

    const addedLimits = parseInt(plan.connection) || 0;
    const durationDays = parseInt(plan.duration) || 0;

    let baseDate = new Date();
    if (user.planExpiryDate && user.planExpiryDate > baseDate) {
      baseDate = user.planExpiryDate;
    }
    
    const planExpiryDate = new Date(baseDate);
    planExpiryDate.setDate(planExpiryDate.getDate() + durationDays);

    await prisma.user.update({
      where: { id: userId },
      data: {
        type: UserType.PAID_USER as any,
        totalLimit: (user.totalLimit || 0) + addedLimits,
        remainingLimit: (user.remainingLimit || 0) + addedLimits,
        planExpiryDate: planExpiryDate,
        activePlanId: plan.id,
      },
    });

    await prisma.userSubscription.create({
      data: {
        userId: userId,
        planId: plan.id,
        startDate: baseDate,
        expiryDate: planExpiryDate,
        isActive: true,
      }
    });

    res.status(200).json(new ApiResponse(200, "Plan claimed successfully for ₹0", null));
  } catch (error: any) {
    res.status(500).json(new ApiError(500, error?.message || "Internal server error"));
  }
}

export async function activateFreePlan(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    // Check if the user has already used the free plan
    const rawUser: any[] = await prisma.$queryRawUnsafe(`SELECT "hasUsedFreePlan" FROM "User" WHERE id = $1`, userId);
    const hasUsedFreePlan = rawUser?.[0]?.hasUsedFreePlan;

    if (hasUsedFreePlan) {
      return res.status(400).json(new ApiError(400, "You have already used the Free Plan once."));
    }
    


    // Fetch the free plan
    const freePlan = await prisma.plan.findFirst({
      where: { price: "0" },
    });

    if (!freePlan) {
      return res.status(404).json(new ApiError(404, "Free plan not found"));
    }

    const addedLimits = parseInt(freePlan.connection) || 0;
    const durationDays = parseInt(freePlan.duration) || 0;
    
    let baseDate = new Date();
    if (user.planExpiryDate && user.planExpiryDate > baseDate) {
      baseDate = user.planExpiryDate;
    }
    
    const planExpiryDate = new Date(baseDate);
    planExpiryDate.setDate(planExpiryDate.getDate() + durationDays);

    await prisma.user.update({
      where: { id: userId },
      data: {
        type: UserType.PAID_USER as any, // Using the enum mapped value
        totalLimit: (user.totalLimit || 0) + addedLimits,
        remainingLimit: (user.remainingLimit || 0) + addedLimits,
        planExpiryDate: planExpiryDate,
        activePlanId: freePlan.id,
      },
    });

    await prisma.userSubscription.create({
      data: {
        userId: userId,
        planId: freePlan.id,
        startDate: baseDate,
        expiryDate: planExpiryDate,
        isActive: true,
      }
    });

    // Mark free plan as used
    await prisma.$executeRawUnsafe(`UPDATE "User" SET "hasUsedFreePlan" = true WHERE id = $1`, userId);

    return res.status(200).json(new ApiResponse(200, "Free plan activated successfully!", null));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getMySubscriptions(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json(new ApiError(401, "Unauthorized"));

    const activeSubscriptions = await prisma.userSubscription.findMany({
      where: {
        userId,
        expiryDate: { gt: new Date() },
        isActive: true,
      },
      orderBy: { expiryDate: "desc" },
    });

    return res.status(200).json(new ApiResponse(200, "Subscriptions fetched successfully", activeSubscriptions));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getPublicProfile(req: Request, res: Response) {
  try {
    const [females, males] = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          type: UserType.PAID_USER,
          isProfileComplete: true,
          gender: "FEMALE",
          blocked: false,
          isProfilePublic: true,
          verificationStatus: "APPROVED",
        },
        select: {
          id: true,
          title: true,
          lastName: true,
          gender: true,
          avatar: true,
          profile: { select: { dob: true, dist: true, state: true } },
        },
        take: 10,
      }),
      prisma.user.findMany({
        where: {
          type: UserType.PAID_USER,
          isProfileComplete: true,
          gender: "MALE",
          blocked: false,
          isProfilePublic: true,
          verificationStatus: "APPROVED",
        },
        select: {
          id: true,
          title: true,
          lastName: true,
          gender: true,
          avatar: true,
          profile: { select: { dob: true, dist: true, state: true } },
        },
        take: 10,
      }),
    ]);

    const profiles = [...females, ...males];
    const shuffled = profiles.sort(() => Math.random() - 0.5);

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Public profiles fetched successfully", shuffled)
      );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getAllPublicProfile(req: Request, res: Response) {
  try {
    const [females, males] = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          type: UserType.PAID_USER,
          isProfileComplete: true,
          gender: "FEMALE",
          blocked: false,
          isProfilePublic: true,
          verificationStatus: "APPROVED",
        },
        select: {
          id: true,
          title: true,
          lastName: true,
          gender: true,
          avatar: true,
          profile: { select: { dob: true, dist: true, state: true } },
        },
        take: 10,
      }),
      prisma.user.findMany({
        where: {
          type: UserType.PAID_USER,
          isProfileComplete: true,
          gender: "MALE",
          blocked: false,
          isProfilePublic: true,
          verificationStatus: "APPROVED",
        },
        select: {
          id: true,
          title: true,
          lastName: true,
          gender: true,
          avatar: true,
          profile: { select: { dob: true, dist: true, state: true } },
        },
        take: 10,
      }),
    ]);

    const profiles = [...females, ...males];
    const shuffled = profiles.sort(() => Math.random() - 0.5);

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Public profiles fetched successfully", shuffled)
      );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function allReceivedInterests(req: Request, res: Response) {
  try {
    const user = req.user;

    // check if already exists
    const allRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: user?.id,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            publicId: true,
            title: true,
            lastName: true,
            gender: true,
            type: true,
            avatar: true,
            isGhotokOwned: true,
            profile: {
              select: {
                dob: true,
                dist: true,
                state: true,
                height: true,
                education: true,
                profession: true,
                subCaste: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const requestWithStatus = await Promise.all(
      allRequests.map(async (requents) => {
        const user = requents.sender;
        const isOnline = await redisService.isUserOnline(requents.sender.id);
        const lastSeen = await redisService.getUserLastSeen(requents.sender.id);
        let status: string;

        if (isOnline) {
          status = "Online";
        } else if (lastSeen) {
          const minutesAgo = differenceInMinutes(new Date(), lastSeen);
          if (minutesAgo <= 2) {
            status = "Online";
          } else {
            status = `Last seen ${formatDistanceToNow(lastSeen, { addSuffix: true })}`;
          }
        } else {
          status = "Offline";
        }

        return {
          ...requents,
          sender: {
            ...user,
            profile: {
              ...user.profile,
              age: user.profile?.dob ? calculateAge(user.profile.dob) : null,
              dob: undefined,
            },
          },
          onlineStatus: status,
        };
      })
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Connection request fetched successfully",
          requestWithStatus
        )
      );
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function allSentInterests(req: Request, res: Response) {
  try {
    const user = req.user;

    // check if already exists
    const allRequests = await prisma.friendRequest.findMany({
      where: {
        senderId: user?.id,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        receiver: {
          select: {
            id: true,
            publicId: true,
            title: true,
            lastName: true,
            gender: true,
            type: true,
            avatar: true,
            isGhotokOwned: true,
            profile: {
              select: {
                dob: true,
                dist: true,
                state: true,
                height: true,
                education: true,
                profession: true,
                subCaste: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const requestWithStatus = await Promise.all(
      allRequests.map(async (requents) => {
        const user = requents.receiver;
        const isOnline = await redisService.isUserOnline(requents.receiver.id);
        const lastSeen = await redisService.getUserLastSeen(
          requents.receiver.id
        );
        let status: string;

        if (isOnline) {
          status = "Online";
        } else if (lastSeen) {
          const minutesAgo = differenceInMinutes(new Date(), lastSeen);
          if (minutesAgo <= 2) {
            status = "Online";
          } else {
            status = `Last seen ${formatDistanceToNow(lastSeen, { addSuffix: true })}`;
          }
        } else {
          status = "Offline";
        }

        return {
          ...requents,
          sender: {
            ...user,
            profile: {
              ...user.profile,
              age: user.profile?.dob ? calculateAge(user.profile.dob) : null,
              dob: undefined,
            },
          },
          onlineStatus: status,
        };
      })
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Connection request fetched successfully",
          requestWithStatus
        )
      );
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function sendInterest(req: Request, res: Response) {
  try {
    const user = req.user;
    const senderId = user?.id as string;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Cannot send request to yourself", null));
    }

    // check if already exists
    const existing = await prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
        status: ConnectionStatus.SENT,
      },
    });

    if (existing) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Request already sent", null));
    }

    await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: ConnectionStatus.SENT,
      },
    });

    res
      .status(200)
      .json(new ApiResponse(200, "Request sent successfully", null));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, "Something went wrong"));
  }
}

export async function acceptInterest(req: Request, res: Response) {
  try {
    const { requestId } = req.body;

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Update connection request
      const request = await tx.friendRequest.update({
        where: { id: requestId },
        data: { status: ConnectionStatus.ACCEPTED },
        include: { sender: true, receiver: true },
      });

      // 2️⃣ Check if conversation already exists
      let conversation = await prisma.conversation.findFirst({
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

      // 3️⃣ Create conversation if not exists
      if (!conversation) {
        const newConversationId = await generateConversationId(tx);
        conversation = await prisma.conversation.create({
          data: {
            convId: newConversationId,
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

export async function connectionRequestReject(req: Request, res: Response) {
  try {
    const { requestId } = req.body;

    // const statusMap: Record<string, ConnectionStatus> = {
    //   ACCEPTED: ConnectionStatus.ACCEPTED,
    //   REJECTED: ConnectionStatus.REJECTED,
    // };

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

export async function deleteInterest(req: Request, res: Response) {
  try {
    const { requestId } = req.body;

    await prisma.friendRequest.deleteMany({
      where: {
        id: requestId,
      },
    });

    res.status(200).json(new ApiResponse(200, "Interest deleted", null));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, "Something went wrong"));
  }
}

// export async function getConversation(req: Request, res: Response) {
//   try {
//     const user = req.user;
//     const senderId = user?.id as string;

//     // find existing conversation

//     const conversations = await prisma.conversation.findMany({
//       where: {
//         participants: {
//           some: { id: senderId }, // fetch only conversations where logged-in user is a participant
//         },
//       },
//       select: {
//         id: true,
//         participants: {
//           where: {
//             NOT: { id: senderId }, // exclude the logged-in user from participants list
//           },
//           take: 1,
//           select: {
//             id: true,
//             title: true,
//             lastName: true,
//             avatar: true,
//           },
//         },
//         messages: {
//           where: {
//             OR: [
//               // 1️⃣ Always show my own messages
//               { senderId: user.id },
//               {
//                 AND: [
//                   { senderId: { not: user.id } },
//                   {
//                     OR: [
//                       { moderation: null },
//                       { moderation: { status: "APPROVED" } },
//                     ],
//                   },
//                 ],
//               },
//             ],
//           },
//           orderBy: { createdAt: "desc" },
//           take: 1,
//           select: {
//             id: true,
//             senderId: true,
//             content: true,
//             createdAt: true,
//             status: true,
//           },
//         },
//         _count: {
//           select: {
//             messages: {
//               where: {
//                 senderId: { not: senderId },
//                 status: { not: "READ" },
//                 OR: [
//                   { moderation: null },
//                   { moderation: { status: "APPROVED" } },
//                 ],
//               },
//             },
//           },
//         },
//       },
//       // 🔥 THIS is the key part
//       orderBy: [
//         {
//           createdAt: "desc", // fallback for empty chats
//         },
//         {
//           lastMessageAt: "desc",
//         },
//       ],
//     });

//     // Get all user IDs for online status lookup
//     const allUserIds = conversations.flatMap((conv) =>
//       conv.participants.map((p) => p.id)
//     );
//     const uniqueUserIds = [...new Set(allUserIds)];

//     // Get online statuses from Redis
//     const onlineStatuses = await redisService.getOnlineStatuses(uniqueUserIds);

//     // Format response with online status from Redis
//     const formattedConversations = conversations.map((conv) => {
//       const otherParticipant = conv.participants[0];
//       const lastMessage = conv.messages[0];

//       // Get online status from Redis instead of database
//       const userStatus = onlineStatuses[otherParticipant?.id || ""];

//       return {
//         id: conv.id,
//         participant: otherParticipant
//           ? {
//               ...otherParticipant,
//               isOnline: userStatus?.isOnline || false,
//               lastSeen: userStatus?.lastSeen || null,
//             }
//           : null,
//         lastMessage: lastMessage
//           ? {
//               id: lastMessage.id,
//               content: lastMessage.content,
//               senderId: lastMessage.senderId,
//               messageStatus: lastMessage.status,
//               createdAt: lastMessage.createdAt,
//               //sentAt: lastMessage.sentAt
//             }
//           : null,
//         unreadCount: conv._count.messages,
//         //updatedAt: conv.updatedAt
//       };
//     });

//     res
//       .status(200)
//       .json(
//         new ApiResponse(
//           200,
//           "Conversation fetched successfully",
//           formattedConversations
//         )
//       );
//   } catch (error) {
//     console.error(error);
//     res.status(500).json(new ApiError(500, "Something went wrong"));
//   }
// }

export async function getConversation(req: Request, res: Response) {
  try {
    const user = req.user;
    const senderId = user?.id as string;

    // find existing conversation

    const [withMessages, withoutMessages] = await prisma.$transaction([
      prisma.conversation.findMany({
        where: {
          participants: {
            some: { id: senderId },
          },
          messages: {
            some: {
              OR: [
                { senderId },
                {
                  AND: [
                    { senderId: { not: senderId } },
                    {
                      OR: [
                        { moderation: null },
                        { moderation: { status: "APPROVED" } },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        select: {
          id: true,
          participants: {
            where: { NOT: { id: senderId } },
            take: 1,
            select: {
              id: true,
              title: true,
              lastName: true,
              avatar: true,
            },
          },
          messages: {
            where: {
              OR: [
                { senderId },
                {
                  AND: [
                    { senderId: { not: senderId } },
                    {
                      OR: [
                        { moderation: null },
                        { moderation: { status: "APPROVED" } },
                      ],
                    },
                  ],
                },
              ],
            },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              senderId: true,
              content: true,
              createdAt: true,
              status: true,
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  senderId: { not: senderId },
                  status: { not: "READ" },
                  OR: [
                    { moderation: null },
                    { moderation: { status: "APPROVED" } },
                  ],
                },
              },
            },
          },
          lastMessageAt: true,
        },
        orderBy: {
          lastMessageAt: "desc",
        },
      }),

      prisma.conversation.findMany({
        where: {
          participants: {
            some: { id: senderId },
          },
          messages: {
            none: {
              OR: [
                { senderId },
                {
                  AND: [
                    { senderId: { not: senderId } },
                    {
                      OR: [
                        { moderation: null },
                        { moderation: { status: "APPROVED" } },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        select: {
          id: true,
          participants: {
            where: { NOT: { id: senderId } },
            take: 1,
            select: {
              id: true,
              title: true,
              lastName: true,
              avatar: true,
            },
          },
          messages: {
            // ✅ ADD THIS
            select: {
              id: true,
              senderId: true,
              content: true,
              createdAt: true,
              status: true,
            },
            take: 0, // 👈 ensures empty array
          },
          _count: {
            select: {
              messages: {
                where: {
                  senderId: { not: senderId },
                  status: { not: "READ" },
                  OR: [
                    { moderation: null },
                    { moderation: { status: "APPROVED" } },
                  ],
                },
              },
            },
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const conversations = [...withMessages, ...withoutMessages];

    // Get all user IDs for online status lookup
    const allUserIds = conversations.flatMap((conv) =>
      conv.participants.map((p) => p.id)
    );
    const uniqueUserIds = [...new Set(allUserIds)];

    // Get online statuses from Redis
    const onlineStatuses = await redisService.getOnlineStatuses(uniqueUserIds);

    // Format response with online status from Redis
    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants[0];
      const lastMessage = conv.messages[0];

      // Get online status from Redis instead of database
      const userStatus = onlineStatuses[otherParticipant?.id || ""];

      return {
        id: conv.id,
        participant: otherParticipant
          ? {
              ...otherParticipant,
              isOnline: userStatus?.isOnline || false,
              lastSeen: userStatus?.lastSeen || null,
            }
          : null,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              messageStatus: lastMessage.status,
              createdAt: lastMessage.createdAt,
              //sentAt: lastMessage.sentAt
            }
          : null,
        unreadCount: conv._count.messages,
        //updatedAt: conv.updatedAt
      };
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Conversation fetched successfully",
          formattedConversations
        )
      );
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, "Something went wrong"));
  }
}

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user?.id; // only from auth middleware
    const { receiverId, content, conversationId } = req.body;

    // 1. Basic validation
    if (!senderId || !receiverId || !content?.trim()) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Missing required fields", null));
    }
    if (content.length > 1000) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Message too long", null));
    }

    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    if (sender?.verificationStatus !== "APPROVED") {
      return res
        .status(403)
        .json(new ApiResponse(403, "Profile verification pending. You cannot send messages until your profile is approved.", null));
    }

    // 2. Prevent spoofing
    if (req.body.senderId && req.body.senderId !== senderId) {
      return res
        .status(400)
        .json(new ApiResponse(403, "Invalid senderId", null));
    }

    // 3. Verify conversation participation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: { select: { id: true } } },
    });

    if (
      !conversation ||
      !conversation.participants.some((p) => p.id === senderId) ||
      !conversation.participants.some((p) => p.id === receiverId)
    ) {
      return res
        .status(400)
        .json(new ApiResponse(403, "Not part of conversation", null));
    }

    // 4. Create message
    const message = await prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          content: content.trim(),
          senderId,
          receiverId,
          conversationId,
        },
      });

      return message;
    });

    // 6. Emit socket event securely
    const receiverSocketId = req.socketUserMap?.get(receiverId);
    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit(MESSAGE_RECEIVE, message);
    }

    return res.status(200).json(new ApiResponse(200, "Message sent", message));
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};

export const getConversationDetails = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { conversationId } = req.params;

    // 1. Check if conversation exists and belongs to this user
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { id: user.id } } },
      select: {
        id: true,
        participants: {
          where: {
            NOT: { id: user.id },
          },
          select: {
            id: true,
            title: true,
            lastName: true,
            avatar: true,
            isGhotokOwned: true,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    return res.json(
      new ApiResponse(200, "Conversation fetched", conversation.participants[0])
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { conversationId } = req.params;

    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;

    // Validate conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: user.id } },
      },
      select: {
        id: true,
        participants: {
          where: { NOT: { id: user.id } },
          select: {
            id: true,
            title: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        OR: [
          { senderId: user.id },
          {
            AND: [
              { senderId: { not: user.id } },
              {
                OR: [
                  { moderation: null },
                  { moderation: { status: "APPROVED" } },
                ],
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        content: true,
        conversationId: true,
        senderId: true,
        receiverId: true,
        status: true,
        createdAt: true,
        moderation: {
          select: {
            status: true,
            reason: true,
          },
        },
      },
      take: limit + 1, // extra 1 to check hasMore
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { createdAt: "desc" },
    });

    const hasMore = messages.length > limit;

    if (hasMore) {
      messages.pop();
    }

    const nextCursor =
      messages.length > 0 ? messages[messages.length - 1]?.id : null;

    return res.json({
      messages: messages,
      hasMore,
      nextCursor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { messageIds } = req.body;
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Invalid message ids", null));
    }
    const result = await prisma.message.updateMany({
      where: { id: { in: messageIds } },
      data: { status: MessageStatus.READ },
    });

    // Find Receiver ID
    const message = await prisma.message.findFirst({
      where: { id: { in: messageIds } },
    });

    // 6. Emit socket event securely
    const senderSocketId = req.socketUserMap?.get(message?.senderId as string);
    if (senderSocketId) {
      req.io.to(senderSocketId).emit(MESSAGE_STATUS_UPDATE, {
        messageIds,
        status: MessageStatus.READ,
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Messages marked as read", null));
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};

export const getAllBlockedUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const blockedUsers = await prisma.blockedUser.findMany({
      where: {
        blockerId: userId,
      },
      select: {
        id: true,
        blocked: {
          select: {
            id: true,
            title: true,
            lastName: true,
            avatar: true,
            gender: true,
            profile: {
              select: {
                dob: true,
                profession: true,
                dist: true,
                state: true,
              }
            }
          },
        },
        createdAt: true,
      },
    });

    const formattedBlockedUsers = blockedUsers.map((blockedUser) => ({
      id: blockedUser.id,
      userId: blockedUser.blocked.id,
      title: blockedUser.blocked.title,
      lastName: blockedUser.blocked.lastName,
      avatar: blockedUser.blocked.avatar,
      gender: blockedUser.blocked.gender,
      profile: blockedUser.blocked.profile,
      createdAt: blockedUser.createdAt,
    }));

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Blocked users fetched", formattedBlockedUsers)
      );
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};

export const blockUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;
    await prisma.blockedUser.create({
      data: {
        blockerId: user?.id as string,
        blockedId: id as string,
      },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "User blocked successfully", null));
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};

export const deleteBlockedData = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await prisma.blockedUser.deleteMany({
      where: {
        blockerId: userId,
        blockedId: id,
      },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "User unblocked successfully", null));
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};

export async function createSubscriptionPayment(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { planId, paymentName, ref, mid } = req.body;
    if (!req.file)
      return res.status(400).json(new ApiError(400, "File not found"));

    if (!userId)
      return res.status(400).json(new ApiError(400, "User not found"));

    if (!planId)
      return res.status(400).json(new ApiError(400, "Plan not found"));

    if (!paymentName)
      return res.status(400).json(new ApiError(400, "Payment name not found"));

    // ✅ Use our storage abstraction instead of direct Cloudinary
    const url = await storageProvider.upload(req.file, "payment/screenshots");

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          userId: userId as string,
          planId: planId as string,
          screenShotUrl: url as string,
          paymentName,
          teamId: ref as string,
          messageId: mid,
        },
      });

      if (mid) {
        await tx.teamUserMessage.update({
          where: {
            id: mid as string,
          },
          data: {
            paymentPhase: "VERIFYING",
          },
        });
      }

      return payment;
    });

    return res.json(
      new ApiResponse(200, "Payment created successfully", result.id)
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getUserPaymentsById(req: Request, res: Response) {
  try {
    const paymentId = req.params.id;
    const userId = req.user?.id;

    if (!userId)
      return res.status(400).json(new ApiError(400, "User not found"));

    // Get payment from database
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
      select: {
        id: true,
        paymentName: true,
        plan: {
          select: {
            id: true,
            title: true,
            price: true,
            duration: true,
            connection: true,
          },
        },
        screenShotUrl: true,
        status: true,
        createdAt: true,
      },
    });

    if (!payment)
      return res.status(404).json(new ApiError(404, "Payment not found"));

    return res.json(new ApiResponse(200, "Payments found", payment));
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getUserMatchingPaymentRequestByMessageId(
  req: Request,
  res: Response
) {
  try {
    const messageId = req.params.messageId;
    const userId = req.user?.id;

    if (!userId)
      return res.status(400).json(new ApiError(400, "User not found"));

    if (!messageId)
      return res.status(400).json(new ApiError(400, "Message not found"));

    // Get payment from database
    const paymentDetails = await prisma.superAdminUserMessage.findFirst({
      where: { id: messageId, type: "PAYMENT" },
      select: {
        price: true,
        content: true,
        paymentPhase: true,
        reportId: true,
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

export async function createMatchingPayment(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { messageId, paymentName } = req.body;
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

    // Get payment from database
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

export async function getUserMatchingPaymentDetailsByPaymentId(
  req: Request,
  res: Response
) {
  try {
    const paymentId = req.params.paymentId;
    const userId = req.user?.id;

    if (!userId)
      return res.status(400).json(new ApiError(400, "User not found"));

    if (!paymentId)
      return res.status(400).json(new ApiError(400, "Message not found"));

    // Get payment from database
    const paymentDetails = await prisma.matchingPayment.findFirst({
      where: { id: paymentId, userId },
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

export async function getUserMatchingPaymentDetailsByMessageId(
  req: Request,
  res: Response
) {
  try {
    const messageId = req.params.messageId;
    const userId = req.user?.id;

    if (!userId)
      return res.status(400).json(new ApiError(400, "User not found"));

    if (!messageId)
      return res.status(400).json(new ApiError(400, "Message not found"));

    // Get payment from database
    const paymentDetails = await prisma.matchingPayment.findFirst({
      where: {
        message: {
          id: messageId,
        },
        userId,
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

export async function getHelpCenterTeam(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const userGender = req.user?.gender as Gender;

    if (!userId)
      return res.status(400).json(new ApiError(400, "User not found"));

    const roleByGender =
      userGender === Gender.MALE ? Role.ADMIN : Role.MODERATOR;

    const response = await prisma.team.findMany({
      where: {
        role: roleByGender,
        blocked: false,
        isProfileComplete: true,
      },
      select: {
        id: true,
        internalId: true,
        lastName: true,
        gender: true,
        role: true,
        teamUserConversation: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    const formattedResponse = response.map((team) => ({
      id: team.id,
      internalId: addIdPrefix(team.internalId.toString(), team.role as Role),
      lastName: team.lastName,
      gender: team.gender,
      conversationId: team.teamUserConversation[0]?.id,
    }));

    return res.json(
      new ApiResponse(
        200,
        "Help center team fetched successfully",
        formattedResponse
      )
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getOrCreateUserTeamConversation(
  req: Request,
  res: Response
) {
  try {
    const chatValidation = new ChatValidationService();
    const currentUser = req.user;
    const currentUserId = currentUser?.id;
    const currentUserGender = currentUser?.gender;

    const { teamId } = req.params;

    if (!currentUserId) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized: User not found"));
    }

    if (!teamId) {
      return res.status(400).json(new ApiError(400, "UserID is required"));
    }

    const requestedTeam = await prisma.team.findFirst({
      where: { id: teamId, blocked: false },
      select: { role: true },
    });

    if (!requestedTeam) {
      res.status(400).json(new ApiError(400, "Team not found"));
    }

    if (currentUserId === teamId) {
      return res
        .status(400)
        .json(new ApiError(400, "You cannot chat with yourself"));
    }

    const validation = chatValidation.canChat(
      requestedTeam?.role as Role,
      currentUserGender as Gender
    );
    if (!validation.allowed) {
      return res
        .status(400)
        .json(new ApiError(400, validation.reason || "Access denied"));
    }
    // default conversation type if caller doesn't supply one
    const convoType =
      currentUserGender === Gender.FEMALE
        ? UserTeamConversationType.MODERATOR_BRIDE
        : UserTeamConversationType.ADMIN_GROOM;

    let conversation = await prisma.teamUserConversation.findFirst({
      where: {
        teamId: teamId,
        userId: currentUserId,
        type: convoType,
      },
    });

    // 2) create if not found
    if (!conversation) {
      conversation = await prisma.teamUserConversation.create({
        data: {
          teamId: teamId,
          userId: currentUserId,
          type: convoType,
        },
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Conversation found", conversation.id));
  } catch (err: any) {
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getUserTeamConversationAndMessages(
  req: Request,
  res: Response
) {
  try {
    const currentUser = req.user;
    const currentUserId = currentUser?.id;
    const { convId } = req.params;

    if (!currentUserId) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized: User ID not found"));
    }

    if (!convId) {
      return res
        .status(400)
        .json(new ApiError(400, "ConversationID is required"));
    }

    const conversation = await prisma.teamUserConversation.findFirst({
      where: {
        id: convId,
      },
      select: {
        team: {
          select: {
            id: true,
            internalId: true,
            gender: true,
            role: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            content: true,
            senderTeamId: true,
            senderUserId: true,
            type: true,
            plan: {
              select: {
                id: true,
                title: true,
                price: true,
                duration: true,
              },
            },
            paymentPhase: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json(new ApiError(404, "Conversation not found"));
    }

    const formattedResponse = {
      participant: {
        id: conversation.team.id,
        internalId: addIdPrefix(
          conversation.team.internalId.toString(),
          conversation.team.role as Role
        ),
        gender: conversation.team.gender,
      },
      messages: conversation.messages.map((message) => ({
        id: message.id,
        content: message.content,
        senderTeamId: message.senderTeamId,
        senderUserId: message.senderUserId,
        type: message.type,
        planId: message.plan?.id,
        planTitle: message.plan?.title,
        planPrice: message.plan?.price,
        planDuration: message.plan?.duration,
        paymentPhase: message.paymentPhase,
        status: message.status,
        createdAt: message.createdAt,
      })),
    };

    return res
      .status(200)
      .json(new ApiResponse(200, "Conversation found", formattedResponse));
  } catch (err: any) {
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getGhotokById(req: Request, res: Response) {
  try {
    const requestedUserId = req.params.id;
    const currentUser = req.user!;

    if (!currentUser.id) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized: User ID not found"));
    }

    if (!requestedUserId) {
      return res.status(400).json(new ApiError(400, "UserID is required"));
    }

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const ghotok = await tx.team.findFirst({
          where: {
            role: Role.GHOTOK,
            ghotokPublicId: requestedUserId,
            blocked: false,
          },
          select: {
            id: true,
            ghotokPublicId: true,
            gender: true,
            ghotokReviews: {
              where: {
                userId: currentUser.id,
              },
              select: {
                rating: true,
                review: true,
                updatedAt: true,
              },
              take: 1,
            },
            _count: {
              select: {
                ghotokReviews: true,
              },
            },
          },
        });

        if (!ghotok) throw new Error("Ghotok not found");

        const reviews = await tx.ghotokReview.aggregate({
          _avg: { rating: true },
          where: { ghotokId: ghotok.id },
        });

        return { ghotok, reviews };
      }
    );

    const { ghotok, reviews } = result;

    const totalCount = ghotok?._count?.ghotokReviews || 0;
    const averageRating = Math.round((reviews._avg.rating || 0) * 10) / 10;

    const formattedGhotok = {
      id: ghotok?.id,
      ghotokPublicId: ghotok?.ghotokPublicId,
      gender: ghotok?.gender,
      averageRating,
      reviewCount: totalCount,
      yourReview: {
        rating: ghotok?.ghotokReviews[0]?.rating,
        review: ghotok?.ghotokReviews[0]?.review,
        updatedAt: ghotok?.ghotokReviews[0]?.updatedAt,
      },
    };

    res.json(
      new ApiResponse(200, "Ghotok fetched successfully", formattedGhotok)
    );
  } catch (err) {
    console.error(err);
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function createGhotokReview(req: Request, res: Response) {
  try {
    const currentUser = req.user!;

    const { ghotokId, rating, review } = req.body;

    if (!currentUser.id) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized: User ID not found"));
    }

    if (!ghotokId) {
      return res
        .status(400)
        .json(new ApiError(400, "Matchmaker ID is required"));
    }

    if (!rating) {
      return res.status(400).json(new ApiError(400, "Rating is required"));
    }

    if (!review) {
      return res.status(400).json(new ApiError(400, "Review is required"));
    }

    await prisma.ghotokReview.upsert({
      where: {
        userId_ghotokId: {
          userId: currentUser.id,
          ghotokId: ghotokId,
        },
      },
      update: {
        rating: rating,
        review: review,
      },
      create: {
        ghotokId,
        userId: currentUser.id,
        rating: rating,
        review,
      },
    });

    res.json(new ApiResponse(200, "Review submitted successfully", null));
  } catch (err) {
    console.error(err);
    res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getAllReportedUsers(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    const allReportedUsers = await prisma.reportUsers.findMany({
      where: {
        reporterId: userId,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        reportedAgainst: {
          select: {
            title: true,
            lastName: true,
            gender: true,
            avatar: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Reported users", allReportedUsers));
  } catch (error) {
    console.log("Error in report submission", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getSingleReportedUsers(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { reportedId } = req.params;

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    if (!reportedId) {
      return res.status(400).json(new ApiError(400, "Reported Id not found"));
    }

    const reportedUsers = await prisma.reportUsers.findFirst({
      where: {
        id: reportedId,
        reporterId: userId,
      },
      select: {
        id: true,
        screenShotUrl: true,
        reason: true,
        reply: true,
        status: true,
        createdAt: true,
        reportedAgainst: {
          select: {
            title: true,
            lastName: true,
            gender: true,
            avatar: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Reported user", reportedUsers));
  } catch (error) {
    console.log("Error in report submission", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function reportProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const file = req.file as Express.Multer.File;
    const { reason, reportedId } = req.body;

    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    if (!reportedId) {
      return res.status(400).json(new ApiError(400, "Reported ID is required"));
    }

    if (!reason)
      return res.status(400).json(new ApiError(400, "Reason is required"));

    let urls;
    if (file) {
      // ✅ Use our storage abstraction instead of direct Cloudinary
      urls = await storageProvider.upload(file, "images/report/users");
    }

    await prisma.reportUsers.create({
      data: {
        screenShotUrl: urls ?? null,
        reason: reason,
        reporterId: userId,
        reportedAgainstId: reportedId,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Report Submitted Successfully", urls));
  } catch (error) {
    console.log("Error in report submission", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}

export async function getOrCreateUserSuperAdminConversation(
  req: Request,
  res: Response
) {
  try {
    const currentUser = req.user;
    const currentUserId = currentUser?.id;

    if (!currentUserId) {
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized: User not found"));
    }

    let conversation = await prisma.superAdminUserConversation.findFirst({
      where: {
        userId: currentUserId,
      },
      select: {
        id: true,
        createdAt: true,
        lastMessageAt: true,
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

    // 2) create if not found
    if (!conversation) {
      conversation = await prisma.superAdminUserConversation.create({
        data: {
          userId: currentUserId,
        },
        select: {
          id: true,
          createdAt: true,
          lastMessageAt: true,
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
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Conversation found", conversation));
  } catch (err: any) {
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getBrideUserIdByProfileId(req: Request, res: Response) {
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

export async function getPaymentIdByMessageId(req: Request, res: Response) {
  try {
    const { messageId } = req.params;

    if (!messageId)
      return res.status(400).json(new ApiError(400, "Message id not found"));

    const payment = await prisma.payment.findFirst({
      where: { messageId },
      select: {
        id: true,
      },
    });

    if (!payment)
      return res.status(400).json(new ApiError(400, "Bride not found"));

    return res
      .status(200)
      .json(new ApiResponse(200, "Bride found", payment.id));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}

export async function getVipProfiles(req: Request, res: Response) {
  try {
    const currentUser = req.user;
    const targetGender = currentUser?.gender === "MALE" ? "FEMALE" : "MALE";

    const vips = await prisma.user.findMany({
      where: {
        gender: targetGender,
        type: UserType.PAID_USER,
        isProfileComplete: true,
        planExpiryDate: { gt: new Date() },
        id: { notIn: currentUser ? [currentUser.id] : [] },
      },
      select: {
        id: true,
        publicId: true,
        title: true,
        lastName: true,
        avatar: true,
        gender: true,
        profile: {
          select: {
            profession: true,
            education: true,
          },
        },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    const randomVips = vips.sort(() => Math.random() - 0.5).slice(0, 3);

    return res.status(200).json(new ApiResponse(200, "VIPs found", randomVips));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
}
