"use client";

import { CheckSquare, ClipboardList, Heart, History, Star } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import ApiErrorPage from "../apiErrorPage";
import { isAxiosError } from "axios";
import LoadingPage from "../loader";
import { Logger } from "../utils/logger";
import api from "@/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "@/types/AxiosResponse";
import { IModeratorDashboard } from "../interface/IModeratorDashbaord";
import {
  TEAM_MENU_APPROVAL_CONVERSATIONS_PATH,
  TEAM_MENU_ASSIGNED_WORK_PATH,
  TEAM_MENU_MATCHING_CONVERSATIONS_PATH,
  TEAM_MENU_REPORT_HISTORY_PATH,
  TEAM_MENU_STARRED_CONVERSATIONS_PATH,
} from "../helper/constant";
import { useRouter } from "next/navigation";

export default function DashboardGridModerator() {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ["moderatorDashboard"],
    queryFn: async () => {
      const response = await api.get<AxiosResponse<IModeratorDashboard>>(
        "/app/moderator/dashboard"
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
      title: "Approval Conversations",
      value: data.approvedConversations,
      icon: CheckSquare,
      color: "text-blue-500",
      link: TEAM_MENU_APPROVAL_CONVERSATIONS_PATH,
    },
    {
      title: "Assigned Work",
      value: data.assignedWork,
      icon: ClipboardList,
      color: "text-emerald-500",
      link: TEAM_MENU_ASSIGNED_WORK_PATH,
    },
    {
      title: "Pre-Matching Room",
      value: data.starredConversation,
      icon: Star,
      color: "text-yellow-500",
      link: TEAM_MENU_STARRED_CONVERSATIONS_PATH,
    },
    {
      title: "Matching Room",
      value: data.matchingConversation,
      icon: Heart,
      color: "text-pink-500",
      link: TEAM_MENU_MATCHING_CONVERSATIONS_PATH,
    },
    {
      title: "Report History",
      value: data.reportHistory,
      icon: History,
      color: "text-orange-500",
      link: TEAM_MENU_REPORT_HISTORY_PATH,
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
