"use server";

import { UserRole } from "@/components/enum/userRole";
import {
  GhotokJoinRequestStatus,
  IGhotokJoinRequest,
} from "@/components/interface/IGhotokJoinRequest";
import { IServerResponse } from "@/components/interface/IServerResponse";
import { ITeams, ITeamUserProfileRequest } from "@/components/interface/ITeam";
import { prisma } from "@/lib/prisma";
import { generateInternalId } from "@/lib/utils";

export async function getProfileRequests(): Promise<ITeams[]> {
  try {
    const allProfileRequest = await prisma.team.findMany({
      where: {
        profileRequest: {
          status: "PENDING",
        },
      },
      select: {
        id: true,
        internalId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        email: true,
        phone: true,
        blocked: true,
        isProfileComplete: true,
        avatar: true,
        role: true,
      },
    });
    return allProfileRequest;
  } catch (error) {
    console.error("Error fetching profile requests:", error);
    return [];
  }
}
export async function getProfileRequestById(
  id: string
): Promise<ITeamUserProfileRequest | null> {
  try {
    const profile = await prisma.teamProfileRequest.findFirst({
      where: {
        teamId: id,
      },
      select: {
        id: true,
        avatar: true,
        dob: true,
        addressLine1: true,
        addressLine2: true,
        postOffice: true,
        policeStation: true,
        dist: true,
        state: true,
        pinCode: true,
        identificationProof: true,
        status: true,
        createdAt: true,
        team: {
          select: {
            id: true,
            internalId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
          },
        },
      },
    });
    return profile;
  } catch (error) {
    console.error("Error fetching ghotok join requests:", error);
    return null;
  }
}

export async function approveProfile(teamId: string): Promise<IServerResponse> {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Get request
      const request = await tx.teamProfileRequest.findUnique({
        where: { teamId },
      });

      if (!request) {
        throw new Error("No profile request found for this team");
      }

      // 2. Upsert into Team & TeamProfile
      await tx.team.update({
        where: { id: teamId },
        data: {
          isProfileComplete: true,
          avatar: request.avatar,
          profile: {
            upsert: {
              update: {
                dob: request.dob,
                identificationProof: request.identificationProof,
                addressLine1: request.addressLine1,
                addressLine2: request.addressLine2,
                postOffice: request.postOffice,
                policeStation: request.policeStation,
                dist: request.dist,
                state: request.state,
                pinCode: request.pinCode,
              },
              create: {
                dob: request.dob,
                identificationProof: request.identificationProof,
                addressLine1: request.addressLine1,
                addressLine2: request.addressLine2,
                postOffice: request.postOffice,
                policeStation: request.policeStation,
                dist: request.dist,
                state: request.state,
                pinCode: request.pinCode,
              },
            },
          },
        },
      });

      // 3. Delete request after transfer
      await tx.teamProfileRequest.delete({
        where: { teamId },
      });
    });

    return {
      success: true,
      message: "Profile request approved successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error fetching ghotok join requests:", error);
    return {
      success: false,
      message: "Failed to approve profile request.",
    } as IServerResponse;
  }
}

export async function rejectProfile(
  teamId: string,
  reason: string
): Promise<IServerResponse> {
  try {
    await prisma.teamProfileRequest.update({
      where: { teamId },
      data: {
        status: "REJECTED",
        feedback: reason,
      },
    });

    return {
      success: true,
      message: "Profile request rejected.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error to reject profile:", error);
    return {
      success: false,
      message: "Failed to reject profile request.",
    } as IServerResponse;
  }
}

export async function getGhotokJoinRequest(): Promise<IGhotokJoinRequest[]> {
  try {
    const ghotoks = await prisma.joinGhotokRequest.findMany({
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        email: true,
        phone: true,
        password: true,
        status: true,
      },
    });
    return ghotoks;
  } catch (error) {
    console.error("Error fetching ghotok join requests:", error);
    return [];
  }
}

export async function approveGhotokJoinRequest(
  id: string
): Promise<IServerResponse> {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update join request status
      await tx.joinGhotokRequest.update({
        where: { id },
        data: { status: GhotokJoinRequestStatus.APPROVED },
      });

      // 2. Fetch approved request data
      const data = await tx.joinGhotokRequest.findUnique({ where: { id } });
      if (!data) {
        throw new Error("Join request not found");
      }

      // 3. Generate sequential internal ID
      const lastGhotok = await tx.team.findFirst({
        where: { role: "GHOTOK" },
        orderBy: { internalId: "desc" },
        select: { internalId: true },
      });
      const newInternalId = generateInternalId(
        UserRole.GHOTOK,
        lastGhotok?.internalId ?? 10000
      );

      // 4. Generate unique 8-digit public ID
      let newPublicId: string;
      let exists = true;
      do {
        newPublicId = Math.floor(
          10000000 + Math.random() * 90000000
        ).toString();
        exists = !!(await tx.team.findUnique({
          where: { ghotokPublicId: newPublicId },
        }));
      } while (exists);

      let phoneToUse = data?.phone || newPublicId;
      const existingTeam = await tx.team.findFirst({
        where: {
          OR: [{ phone: phoneToUse }, { username: phoneToUse }],
        },
      });

      if (existingTeam) {
        throw new Error("This phone number is already registered.");
      }

      let emailToUse = data?.email ? data.email : null;
      if (emailToUse) {
        const existingEmail = await tx.team.findUnique({
          where: { email: emailToUse },
        });
        if (existingEmail) {
          throw new Error("This email is already registered.");
        }
      }

      // 5. Create ghotok user
      const ghotok = await tx.team.create({
        data: {
          internalId: newInternalId,
          firstName: data?.firstName ?? "",
          middleName: data?.middleName,
          lastName: data?.lastName ?? "",
          gender: data?.gender ?? "MALE",
          phone: phoneToUse,
          username: phoneToUse,
          displayUsername: phoneToUse,
          email: emailToUse,
          role: UserRole.GHOTOK,
          ghotokPublicId: newPublicId,
        },
      });

      await tx.teamAccount.create({
        data: {
          accountId: ghotok.id,
          providerId: "credential",
          userId: ghotok.id,
          password: data?.password ?? "",
        },
      });
    });

    //FIXME : Send Email Notification

    return {
      success: true,
      message: "Ghotok join request approved.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error approving ghotok join request:", error);
    return {
      success: false,
      message: error instanceof Error ? `Failed to approve ghotok join request. ${error.message}` : "Failed to approve ghotok join request.",
    } as IServerResponse;
  }
}

export async function pendingGhotokJoinRequest(
  id: string
): Promise<IServerResponse> {
  try {
    await prisma.joinGhotokRequest.update({
      where: { id },
      data: { status: GhotokJoinRequestStatus.PENDING },
    });

    return {
      success: true,
      message: "Ghotok join request pending.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error pending ghotok join request:", error);
    return {
      success: false,
      message: "Failed to pending ghotok join request.",
    } as IServerResponse;
  }
}

export async function rejectGhotokJoinRequest(
  id: string
): Promise<IServerResponse> {
  try {
    await prisma.joinGhotokRequest.update({
      where: { id },
      data: { status: GhotokJoinRequestStatus.REJECTED },
    });

    //FIXME : Send Email Notification

    return {
      success: true,
      message: "Ghotok join request rejected.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error rejecting ghotok join request:", error);
    return {
      success: false,
      message: "Failed to reject ghotok join request.",
    } as IServerResponse;
  }
}

export async function deleteGhotokJoinRequest(
  id: string
): Promise<IServerResponse> {
  try {
    await prisma.joinGhotokRequest.delete({ where: { id } });
    return {
      success: true,
      message: "Ghotok join request deleted.",
    };
  } catch (error) {
    console.error("Error deleting ghotok join request:", error);
    return {
      success: false,
      message: "Failed to delete ghotok join request.",
    };
  }
}
