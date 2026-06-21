"use client";

import { getSingleReportedUsers } from "@/actions/users";
import ApiErrorPage from "@/components/apiErrorPage";
import DashboardHeader from "@/components/dashboard/header";
import LoadingPage from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { format } from "date-fns";
import { Reply } from "lucide-react";
import Image from "next/image";

export default function ReportedUserClientPage({
  reportedId,
}: {
  reportedId: string;
}) {
  const {
    data: reportedUser,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["getSingleReportedUsers", reportedId],
    queryFn: () => getSingleReportedUsers(reportedId),
    //enabled: userType !== UserType.FREE_USER,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load profile"
      : "Something went wrong";

    return (
      <ApiErrorPage
        title={"Failed to load reported user"}
        description={errorMessage}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-0px)]">
      <DashboardHeader
        title={
          <div className="w-full flex items-center justify-center gap-2 bg-primary/20 p-4">
            <h1 className="font-semibold text-lg md:text-xl">
              Reported Profile
            </h1>
          </div>
        }
      />

      {reportedUser && (
        <div className="flex flex-col p-3 md:p-4 overflow-y-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full">
              <Avatar className={"size-14"}>
                <AvatarImage
                  src={
                    reportedUser?.reportedAgainst?.avatar
                      ? reportedUser?.reportedAgainst?.avatar
                      : reportedUser?.reportedAgainst?.gender === "MALE"
                      ? "/groom.webp"
                      : "/bride.webp"
                  }
                  alt={reportedUser?.id}
                  className="object-cover"
                />
                <AvatarFallback>
                  {reportedUser?.reportedAgainst.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="w-full flex flex-col">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg md:text-xl lg:text-2xl">
                    {reportedUser?.reportedAgainst.title}{" "}
                    {reportedUser?.reportedAgainst.lastName}
                  </h1>
                  <div
                    className={`flex items-center rounded-full text-xs px-2 py-0.5 font-semibold text-white ${
                      reportedUser?.status === "PENDING"
                        ? " bg-orange-600"
                        : reportedUser?.status === "ACCEPTED"
                        ? " bg-green-600"
                        : " bg-destructive"
                    }`}
                  >
                    <span>{reportedUser?.status}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reported on{" "}
                  {format(
                    new Date(reportedUser?.createdAt as string),
                    "dd-MM-yyyy"
                  )}
                </p>
              </div>
            </div>
          </div>
          <Separator className="mt-3" />

          <div className="flex flex-col gap-2 mt-3">
            <div className="bg-neutral-200 dark:bg-neutral-800 py-2 px-3 rounded-2xl">
              <p className="text-sm text-muted-foreground">Reason</p>
              <p>{reportedUser?.reason}</p>
            </div>
            {reportedUser?.reply && (
              <div className="bg-neutral-200 dark:bg-neutral-800 py-2 px-3 rounded-2xl">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Reply className="w-4 h-4" /> Reply
                </span>
                <p>{reportedUser?.reply}</p>
              </div>
            )}

            {reportedUser?.screenShotUrl && (
              <Image
                src={reportedUser?.screenShotUrl}
                alt={reportedUser?.id}
                width={900}
                height={1600}
                className="object-cover rounded-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
