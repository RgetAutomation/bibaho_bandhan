"use client";

import {
  MessagesSquare,
  HeartHandshake,
  CreditCard,
  Users,
  UserCheck,
  UserX,
  Ban,
  Flag,
  HelpCircle,
} from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";
import { Logger } from "../utils/logger";
import { IAdminDashboard } from "../interface/IAdminDashbaord";
import LoadingPage from "../loader";
import { isAxiosError } from "axios";
import ApiErrorPage from "../apiErrorPage";
import { useRouter } from "next/navigation";
import {
  ADMIN_MENU_BLOCKED_GROOMS_PATH,
  ADMIN_MENU_BLOCKED_GROOMS_TITLE,
  ADMIN_MENU_CONVERSATIONS_PATH,
  ADMIN_MENU_CONVERSATIONS_TITLE,
  ADMIN_MENU_END_PLAN_GROOMS_PATH,
  ADMIN_MENU_END_PLAN_GROOMS_TITLE,
  ADMIN_MENU_FREE_GROOMS_PATH,
  ADMIN_MENU_FREE_GROOMS_TITLE,
  ADMIN_MENU_HELP_REQUEST_TITLE,
  ADMIN_MENU_HELP_REQUEST_TITLE_PATH,
  ADMIN_MENU_MATCHING_ROOM_PATH,
  ADMIN_MENU_MATCHING_ROOM_TITLE,
  ADMIN_MENU_PAID_GROOMS_PATH,
  ADMIN_MENU_PAID_GROOMS_TITLE,
  ADMIN_MENU_PAYMENT_PATH,
  ADMIN_MENU_PAYMENT_TITLE,
  ADMIN_MENU_REPORTED_GROOM_PATH,
  ADMIN_MENU_REPORTED_GROOM_TITLE,
} from "../helper/constant";

export default function DashboardGrid() {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const response = await api.get<AxiosResponse<IAdminDashboard>>(
        "/app/admin/dashboard"
      );
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className={"flex flex-1 flex-col"}>
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load dashboard"
      : "Something went wrong. Please try again later.";

    return (
      <div className={"flex flex-1 items-center justify-center"}>
        <ApiErrorPage
          title={"Failed to load dashboard"}
          description={errorMessage}
        />
      </div>
    );
  }

  if (!data) return null;

  const items = [
    {
      title: ADMIN_MENU_CONVERSATIONS_TITLE,
      value: data.conversations,
      icon: MessagesSquare,
      color: "text-blue-500",
      link: ADMIN_MENU_CONVERSATIONS_PATH,
    },
    {
      title: ADMIN_MENU_MATCHING_ROOM_TITLE,
      value: data.matchingRoom,
      icon: HeartHandshake,
      color: "text-pink-500",
      link: ADMIN_MENU_MATCHING_ROOM_PATH,
    },
    {
      title: ADMIN_MENU_PAYMENT_TITLE,
      value: data.paymentReceived,
      icon: CreditCard,
      color: "text-emerald-500",
      link: ADMIN_MENU_PAYMENT_PATH,
    },
    {
      title: ADMIN_MENU_HELP_REQUEST_TITLE,
      value: data.helpRequests,
      icon: HelpCircle,
      color: "text-indigo-500",
      link: ADMIN_MENU_HELP_REQUEST_TITLE_PATH,
    },
    {
      title: ADMIN_MENU_FREE_GROOMS_TITLE,
      value: data.freeGrooms,
      icon: Users,
      color: "text-orange-500",
      link: ADMIN_MENU_FREE_GROOMS_PATH,
    },
    {
      title: ADMIN_MENU_PAID_GROOMS_TITLE,
      value: data.paidGrooms,
      icon: UserCheck,
      color: "text-green-500",
      link: ADMIN_MENU_PAID_GROOMS_PATH,
    },
    {
      title: ADMIN_MENU_END_PLAN_GROOMS_TITLE,
      value: data.endPlanGrooms,
      icon: UserX,
      color: "text-red-500",
      link: ADMIN_MENU_END_PLAN_GROOMS_PATH,
    },
    {
      title: ADMIN_MENU_BLOCKED_GROOMS_TITLE,
      value: data.blockedGrooms,
      icon: Ban,
      color: "text-gray-500",
      link: ADMIN_MENU_BLOCKED_GROOMS_PATH,
    },
    {
      title: ADMIN_MENU_REPORTED_GROOM_TITLE,
      value: data.reportedGrooms,
      icon: Flag,
      color: "text-yellow-500",
      link: ADMIN_MENU_REPORTED_GROOM_PATH,
    },
  ];

  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <DashboardCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          color={item.color}
          onClick={() => item.link && router.push(item.link)}
        />
      ))}
    </div>
  );
}
