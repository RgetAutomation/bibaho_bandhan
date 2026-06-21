"use server";

import {
  IFullPaymentAndUser,
  IMatchingPayments,
  IPaymentFullUser,
  ISubscribedPayments,
  ISubscribedPaymentsWithPlan,
} from "@/components/interface/IPayments";
import { IServerResponse } from "@/components/interface/IServerResponse";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, Prisma } from "@prisma/client";
import { addDays } from "date-fns";

function buildSortWhere(sortBy?: string): Prisma.PaymentWhereInput {
  switch (sortBy) {
    case "pending":
      return {
        status: "PENDING",
      };

    case "approved":
      return {
        status: "APPROVED",
      };

    case "rejected":
      return {
        status: "REJECTED",
      };
    default:
      return {};
  }
}

export async function getSubscriptionPayments({
  page = 1,
  limit = 9,
  teamId,
  sortBy = "all",
}: {
  page?: number;
  limit?: number;
  teamId?: string | null;
  sortBy?: string;
}): Promise<{
  data: ISubscribedPayments[];
  total: number;
  totalPages: number;
  page: number;
}> {
  try {
    const where: Prisma.PaymentWhereInput = {
      paymentType: "SUBSCRIPTION",
      ...buildSortWhere(sortBy),
    };

    // Team filtering logic
    if (teamId === "user") {
      where.teamId = null;
    } else if (teamId && teamId !== "all") {
      where.teamId = teamId;
    }

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        select: {
          id: true,
          screenShotUrl: true,
          status: true,
          paymentName: true,
          feedback: true,
          createdAt: true,
          plan: {
            select: {
              price: true,
            },
          },
          user: {
            select: {
              id: true,
              title: true,
              firstName: true,
              middleName: true,
              lastName: true,
              phone: true,
              avatar: true,
              gender: true,
            },
          },
          team: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              avatar: true,
              gender: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);
    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    };
  } catch (error) {
    console.error("Error fetching plans:", error);
    return {
      data: [],
      total: 0,
      totalPages: 0,
      page: 0,
    };
  }
}

export async function getMatchingPayments(): Promise<IMatchingPayments[]> {
  try {
    const payments = await prisma.matchingPayment.findMany({
      select: {
        id: true,
        amount: true,
        screenShotUrl: true,
        status: true,
        feedback: true,
        createdAt: true,
        paymentName: true,
        user: {
          select: {
            id: true,
            title: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            phone: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedPayments = payments.map((payment) => ({
      ...payment,
      amount: payment.amount.toNumber() || 0,
    }));

    return formattedPayments;
  } catch (error) {
    console.error("Error fetching plans:", error);
    return [];
  }
}

export async function getDuePayments(): Promise<IPaymentFullUser[]> {
  try {
    const payments = await prisma.user.findMany({
      where: {
        type: "PAID",
        planExpiryDate: { lte: new Date() },
        gender: "MALE",
      },
      select: {
        id: true,
        title: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        phone: true,
        email: true,
        avatar: true,
        planExpiryDate: true,
        blocked: true,
      },
      orderBy: {
        planExpiryDate: "desc",
      },
    });

    const formattedPayments = payments.map((payment) => ({
      ...payment,
      planExpiryDate: payment.planExpiryDate || null,
    }));

    return formattedPayments;
  } catch (error) {
    console.error("Error fetching due payments:", error);
    return [];
  }
}

export async function getAllPaymentByUserId(
  userId: string
): Promise<IFullPaymentAndUser | null> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        title: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        phone: true,
        email: true,
        avatar: true,
        planExpiryDate: true,
        blocked: true,
        payments: {
          select: {
            id: true,
            plan: {
              select: {
                price: true,
              },
            },
            screenShotUrl: true,
            status: true,
            paymentType: true,
            paymentName: true,
            feedback: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) return null;

    const formattedUser: IFullPaymentAndUser = {
      id: user.id,
      title: user.title,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      gender: user.gender,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
      blocked: user.blocked,
      planExpiryDate: user.planExpiryDate || null,
      payments: user.payments.map((payment) => ({
        ...payment,
        planExpiryDate: user.planExpiryDate || null, // optional if you want to include it
      })),
    };

    return formattedUser;
  } catch (error) {
    console.error("Error fetching payments by user:", error);
    return null;
  }
}

export async function getMatchingPaymentDetailsByPaymentId(
  paymentId: string
): Promise<IMatchingPayments | null> {
  try {
    const paymentDetails = await prisma.matchingPayment.findFirst({
      where: {
        id: paymentId,
      },
      select: {
        id: true,
        amount: true,
        screenShotUrl: true,
        status: true,
        feedback: true,
        createdAt: true,
        paymentName: true,
        user: {
          select: {
            id: true,
            title: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    if (!paymentDetails) return null;

    const formattedPayment = {
      ...paymentDetails,
      amount: paymentDetails?.amount.toNumber() || 0,
    };

    return formattedPayment;
  } catch (error) {
    console.error("Error fetching payment details by payment id:", error);
    return null;
  }
}

export async function getSubscriptionPaymentDetailsByPaymentId(
  paymentId: string
): Promise<ISubscribedPaymentsWithPlan | null> {
  try {
    const paymentDetails = await prisma.payment.findFirst({
      where: {
        id: paymentId,
      },
      select: {
        id: true,
        plan: {
          select: {
            title: true,
            price: true,
            duration: true,
          },
        },
        screenShotUrl: true,
        status: true,
        feedback: true,
        paymentName: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            title: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    if (!paymentDetails) return null;

    return paymentDetails;
  } catch (error) {
    console.error("Error fetching payment details by payment id:", error);
    return null;
  }
}

export async function updateSubscriptionPaymentStatus(
  userId: string,
  paymentId: string,
  status: PaymentStatus,
  feedback: string
): Promise<IServerResponse> {
  try {
    const superAdminResponse = status === "APPROVED";
    const messageStatus =
      status === "APPROVED"
        ? "APPROVED"
        : status === "REJECTED"
          ? "REJECTED"
          : "VERIFYING";

    await prisma.$transaction(async (tx) => {
      // 1. Update payment
      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: { status, feedback },
        select: {
          plan: {
            select: {
              duration: true,
              connection: true,
            },
          },
          messageId: true,
          planId: true,
        },
      });

      // 2. If subscription is approved → update user
      if (superAdminResponse) {
        const currentUser = await tx.user.findUnique({
          where: { id: userId },
          select: { planExpiryDate: true, totalLimit: true, remainingLimit: true },
        });

        let baseDate = new Date();
        if (currentUser?.planExpiryDate && currentUser.planExpiryDate > baseDate) {
          baseDate = currentUser.planExpiryDate;
        }

        const addedLimits = parseInt(payment.plan.connection as string) || 0;

        const newExpiryDate = addDays(
          baseDate,
          parseInt(payment.plan.duration as string) || 0
        );

        await tx.user.update({
          where: { id: userId },
          data: {
            type: "PAID",
            planStartDate: new Date(),
            planExpiryDate: newExpiryDate,
            totalLimit: (currentUser?.totalLimit || 0) + addedLimits,
            remainingLimit: (currentUser?.remainingLimit || 0) + addedLimits,
            activePlanId: payment.planId,
          },
        });

        await tx.userSubscription.create({
          data: {
            userId: userId,
            planId: payment.planId,
            startDate: baseDate,
            expiryDate: newExpiryDate,
            isActive: true,
          }
        });
      }

      if (payment.messageId) {
        await tx.teamUserMessage.updateMany({
          where: { id: payment.messageId! },
          data: { paymentPhase: messageStatus },
        });
      }
    });

    return {
      success: true,
      message: "Payment status updated successfully.",
    };
  } catch (error: any) {
    console.error("Error updating payment status:", error);
    return {
      success: false,
      message: error?.message || "Failed to update payment status.",
    };
  }
}

export async function updateMatchingPaymentStatus(
  //userId: string,
  paymentId: string,
  status: PaymentStatus,
  feedback: string
): Promise<IServerResponse> {
  try {
    const superAdminResponse = status === "APPROVED";
    const messageStatus =
      status === "APPROVED"
        ? "APPROVED"
        : status === "REJECTED"
          ? "REJECTED"
          : "VERIFYING";
    const matchingRoomStatus =
      status === "APPROVED"
        ? "APPROVED"
        : status === "REJECTED"
          ? "REJECTED"
          : "PENDING";

    await prisma.$transaction(async (tx) => {
      // 1. Update payment
      const payment = await tx.matchingPayment.update({
        where: { id: paymentId },
        data: {
          status,
          feedback,
          message: {
            update: {
              paymentPhase: messageStatus,
            },
          },
        },
        select: {
          userId: true,
          message: {
            select: {
              reportId: true,
            },
          },
        },
      });

      await prisma.matchingReport.update({
        where: {
          id: payment?.message?.reportId || "",
        },
        data: {
          status: matchingRoomStatus,
        },
      });

      // 2. If subscription is approved → update user
      if (superAdminResponse) {
        await tx.user.update({
          where: { id: payment.userId },
          data: {
            type: "PAID",
            matchingStartDate: new Date(),
            matchingExpiryDate: addDays(new Date(), 365),
            hasMatched: true,
            // totalLimit: Number(payment.plan.connection || 0),
            // remainingLimit: Number(payment.plan.connection || 0),
          },
        });
      }
    });

    return {
      success: true,
      message: "Payment status updated successfully.",
    };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return {
      success: false,
      message: "Failed to update payment status.",
    };
  }
}

export async function deleteMatchingPayment(
  paymentId: string
): Promise<IServerResponse> {
  try {
    await prisma.matchingPayment.delete({
      where: { id: paymentId },
    });

    //TODO : delete matching report image

    return {
      success: true,
      message: "Payment deleted successfully.",
    };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return {
      success: false,
      message: "Failed to delete payment",
    };
  }
}
