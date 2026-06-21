"use client";

import ContentNotFound from "@/components/contentNotFound";
import { GroomBadgeType } from "@/components/enum/GroomBadgeType";
import { GroomComponent } from "@/components/helper/admin/groom-component";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getEndPlanGrooms } from "@/actions/getGrooms";
import ApiErrorPage from "@/components/apiErrorPage";
import { Groom } from "@/types/groom";
import LoadingPage from "@/components/loader";
import { isAxiosError } from "axios";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EndPlanGroomClient() {
  const [selectedDays, setSelectedDays] = useState("30");
  const { data, isLoading, error } = useQuery({
    queryKey: ["getAllEndPlanGrooms"],
    queryFn: () => getEndPlanGrooms(),
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load end plan grooms"
      : "Something went wrong. Please try again later.";
    return (
      <ApiErrorPage
        title={"Failed to load grooms"}
        description={errorMessage}
      />
    );
  }

  const fillteredData = data?.filter((groom: Groom) => {
    const createdDate = new Date(groom.planExpiryDate as string);
    const today = new Date();
    const differenceInDays = Math.floor(
      (today.getTime() - createdDate.getTime()) / (1000 * 3600 * 24)
    );
    return differenceInDays <= parseInt(selectedDays);
  });

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col md:min-h-min">
      <div className="bg-card flex w-full flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6">
        <h1 className="text-lg font-bold md:text-xl lg:text-2xl">
          End Plan Grooms
        </h1>
        <Select onValueChange={setSelectedDays} defaultValue="30">
          <SelectTrigger className="w-full md:w-60">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="60">Last 2 months</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="365">Last 1 year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {fillteredData && fillteredData.length > 0 ? (
        <div className="grid w-full grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
          {fillteredData.map((groom: Groom) => (
            <GroomComponent
              key={groom.id}
              groom={groom}
              groomBadge={GroomBadgeType.EXPIRED}
              canReport={true}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-screen w-full flex-1 items-center justify-center md:min-h-min">
          <ContentNotFound
            title={"End Plan Grooms Not Found"}
            description={
              "We couldn't find any end plan grooms. Please try again later."
            }
          />
        </div>
      )}
    </div>
  );
}
