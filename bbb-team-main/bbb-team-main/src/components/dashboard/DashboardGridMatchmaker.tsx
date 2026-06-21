"use client";

import { HeartHandshake, Crown, UserRound } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import ApiErrorPage from "../apiErrorPage";
import { isAxiosError } from "axios";
import LoadingPage from "../loader";
import api from "@/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "@/types/AxiosResponse";
import { Logger } from "../utils/logger";
import { IGhotokDashboard } from "../interface/IGhotokDashboard";
import { useRouter } from "next/navigation";
import {
  GHOTOK_MENU_CONNECTION_REQUEST_PATH,
  GHOTOK_MENU_CONNECTION_REQUEST_TITLE,
  GHOTOK_MENU_MY_BRIDES_PATH,
  GHOTOK_MENU_MY_BRIDES_TITLE,
  GHOTOK_MENU_MY_GROOMS_PATH,
  GHOTOK_MENU_MY_GROOMS_TITLE,
  GHOTOK_MENU_PAID_MATCHING_PATH,
  GHOTOK_MENU_PAID_MATCHING_TITLE,
} from "../helper/constant";

export default function DashboardGridMatchmaker() {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ["matchmakerDashboard"],
    queryFn: async () => {
      const response = await api.get<AxiosResponse<IGhotokDashboard>>(
        "/app/ghotok/dashboard"
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
      title: GHOTOK_MENU_CONNECTION_REQUEST_TITLE,
      value: data.connectionRequest,
      icon: HeartHandshake,
      link: GHOTOK_MENU_CONNECTION_REQUEST_PATH,
      color: "text-emerald-500",
    },
    {
      title: GHOTOK_MENU_MY_BRIDES_TITLE,
      value: data.brides,
      icon: UserRound,
      link: GHOTOK_MENU_MY_BRIDES_PATH,
      color: "text-pink-500",
    },
    {
      title: GHOTOK_MENU_MY_GROOMS_TITLE,
      value: data.grooms,
      icon: UserRound,
      link: GHOTOK_MENU_MY_GROOMS_PATH,
      color: "text-blue-500",
    },
    {
      title: GHOTOK_MENU_PAID_MATCHING_TITLE,
      value: data.paidMatching,
      icon: Crown,
      link: GHOTOK_MENU_PAID_MATCHING_PATH,
      color: "text-yellow-500",
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
