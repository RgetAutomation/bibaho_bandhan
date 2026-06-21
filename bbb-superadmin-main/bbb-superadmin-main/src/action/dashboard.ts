import {
  IDashboardCounts,
  IUserJoinSeries,
} from "@/components/interface/IDahboard";
import { prisma } from "@/lib/prisma"; // adjust import to your project
import { format, subMonths } from "date-fns";

export async function getDashboardCounts(): Promise<IDashboardCounts> {
  const today = new Date();
  const startDate = subMonths(today, 5);

  const [
    plansCount,
    reportedCount,
    expireUsersCount,
    genderStats,
    roleStats,
    userJoinData,
    paymentStatusData,
    recentPayments,
    matchingPayments,
    teamProfileRequests,
    ghotokJoinRequest,
    reportedUsers,
    publicFeedback,
    activePlans,
  ] = await prisma.$transaction([
    prisma.plan.count({ where: { status: true } }),
    prisma.reportUsers.count(),
    prisma.user.count({
      where: {
        planExpiryDate: { lte: new Date() },
        type: "PAID",
        gender: "MALE",
        blocked: false,
      },
    }),
    prisma.user.groupBy({
      by: ["gender"],
      _count: { gender: true },
      orderBy: { gender: "asc" }, // required in Prisma 5
    }),
    prisma.team.groupBy({
      by: ["role"],
      _count: { role: true },
      orderBy: { role: "asc" }, // required in Prisma 5
    }),
    prisma.user.groupBy({
      by: ["createdAt"], // we'll truncate to month
      _count: { createdAt: true },
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.payment.groupBy({
      by: ["status"], // assuming your Payment table has a 'status' field
      _count: { status: true },
      where: { paymentType: "SUBSCRIPTION" },
      orderBy: { status: "asc" },
    }),
    //Recent payments
    prisma.payment.findMany({
      where: {
        paymentType: "SUBSCRIPTION",
      },
      select: {
        createdAt: true,
        status: true,
        plan: {
          select: {
            price: true,
          },
        },
        user: {
          select: {
            publicId: true,
            title: true,
            firstName: true,
            middleName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    prisma.matchingPayment.findMany({
      select: {
        amount: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            publicId: true,
            title: true,
            firstName: true,
            middleName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),

    prisma.teamProfileRequest.findMany({
      where: {
        status: "PENDING",
      },
      select: {
        id: true,
        createdAt: true,
        team: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
      take: 2,
      orderBy: { createdAt: "desc" },
    }),

    prisma.joinGhotokRequest.findMany({
      where: {
        status: "PENDING",
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
      take: 2,
      orderBy: { createdAt: "desc" },
    }),

    prisma.reportUsers.findMany({
      where: {
        status: "PENDING",
      },
      select: {
        id: true,
        createdAt: true,
        reason: true,
        reportedAgainst: {
          select: {
            id: true,
            title: true,
            firstName: true,
            middleName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      take: 2,
      orderBy: { createdAt: "desc" },
    }),

    prisma.feedback.findMany({
      select: {
        id: true,
        rating: true,
        name: true,
        feedback: true,
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),

    prisma.plan.findMany({
      where: {
        status: true,
      },
      select: {
        id: true,
        title: true,
        price: true,
        duration: true,
        connection: true,
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const genderCount = (
    genderStats as {
      gender: "MALE" | "FEMALE";
      _count: { gender: number };
    }[]
  ).reduce(
    (acc, g) => {
      const gender = g.gender.toLowerCase() as "male" | "female";
      acc[gender] = g._count.gender;
      return acc;
    },
    { male: 0, female: 0 }
  );

  // convert role groupBy result to object
  const roleCounts = (
    roleStats as {
      role: "ADMIN" | "MODERATOR" | "GHOTOK";
      _count: { role: number };
    }[]
  ).reduce(
    (acc, r) => {
      const role = r.role.toLowerCase() as "admin" | "moderator" | "ghotok";
      acc[role] = r._count.role;
      return acc;
    },
    { admin: 0, moderator: 0, ghotok: 0 }
  );

  const months: IUserJoinSeries[] = [];
  // Generate last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(today, i);
    const monthLabel = format(date, "MMM"); // e.g., "Apr"
    months.push({ month: monthLabel, count: 0 });
  }
  userJoinData.forEach((u) => {
    const month = format(u.createdAt, "MMM");
    const index = months.findIndex((m) => m.month === month);
    if (index !== -1) months[index].count += 1;
  });

  type PaymentStatusName = "APPROVED" | "PENDING" | "REJECTED";
  const paymentStatus: Record<PaymentStatusName, number> = {
    APPROVED: 0,
    PENDING: 0,
    REJECTED: 0,
  };
  // Map DB counts into the array
  // Count by status
  paymentStatusData.forEach((p) => {
    const status = p.status as PaymentStatusName;
    if (status in paymentStatus) {
      paymentStatus[status] += 1;
    }
  });
  const formatPaymentStatus = (
    Object.keys(paymentStatus) as PaymentStatusName[]
  ).map((name) => ({
    name,
    value: paymentStatus[name],
  }));

  return {
    plansCount,
    reportedCount,
    expireUsersCount,
    bride: genderCount.female,
    groom: genderCount.male,
    admin: roleCounts.admin,
    moderator: roleCounts.moderator,
    ghotok: roleCounts.ghotok,
    userJoinData: months,
    paymentStatus: formatPaymentStatus,
    recentPayments,
    matchingPayments,
    teamProfileRequests,
    ghotokJoinRequest,
    reportedUsers,
    publicFeedback,
    activePlans,
  } as IDashboardCounts;
}
