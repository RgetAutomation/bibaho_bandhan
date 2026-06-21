import { Decimal } from "@prisma/client/runtime/library";

export interface IDashboardCounts {
  plansCount: number;
  expireUsersCount: number;
  bride: number;
  groom: number;
  admin: number;
  moderator: number;
  ghotok: number;
  reportedCount: number;
  userJoinData: IUserJoinSeries[];
  paymentStatus: IPaymentStatus[];
  recentPayments: IDashboardRecentPayment[];
  matchingPayments: IDashboardMatchingPayment[];
  teamProfileRequests: IDashboardTeamProfileRequest[];
  ghotokJoinRequest: IDashboardGhotokJoinRequest[];
  reportedUsers: IDashboardReportedUser[];
  publicFeedback: IDashboardPublicFeedback[];
  activePlans: IDashboardPlans[];
}

export interface IUserJoinSeries {
  month: string;
  count: number;
}

export interface IPaymentStatus {
  name: PaymentStatus;
  value: number;
}

export interface IDashboardRecentPayment {
  createdAt: Date;
  status: string;
  plan: {
    price: string;
  };
  user: {
    publicId: string;
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    avatar: string;
  };
}

export interface IDashboardMatchingPayment {
  createdAt: Date;
  status: string;
  amount: Decimal;
  user: {
    publicId: string;
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    avatar: string;
  };
}

export interface IDashboardTeamProfileRequest {
  id: string;
  createdAt: Date;
  team: {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    avatar: string;
    role: string;
  };
}

export interface IDashboardGhotokJoinRequest {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  phone: string;
  createdAt: Date;
}

export interface IDashboardReportedUser {
  id: string;
  createdAt: Date;
  reason: string;
  reportedAgainst: {
    id: string;
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    avatar: string;
  };
}

export interface IDashboardPublicFeedback {
  id: string;
  rating: string;
  name: string;
  feedback: string;
}

export interface IDashboardPlans {
  id: string;
  title: string;
  price: string;
  duration: string;
  connection: string;
}

export enum PaymentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}
