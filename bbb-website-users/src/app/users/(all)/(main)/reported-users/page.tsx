"use client";

import { getReportedUsers } from "@/actions/users";
import ApiErrorPage from "@/components/apiErrorPage";
import DashboardHeader from "@/components/dashboard/header";
import { PlansSection } from "@/components/dashboard/planSection";
import { UserType } from "@/components/enum/userType";
import LoadingPage from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthSession } from "@/hooks/useAuthSession";
import { isPaidUser, NotPaidUserReason } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { format } from "date-fns";
import { Info } from "lucide-react";
import Link from "next/link";

export default function ReportedUsersPage() {
  const { user, isPending } = useAuthSession();
  const userType = user?.type as UserType;
  const isPaid = isPaidUser(userType, new Date(user?.planExpiryDate as string));

  const {
    data: reportedUsers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["getReportedUsers"],
    queryFn: () => getReportedUsers(),
    //enabled: userType !== UserType.FREE_USER,
  });

  if (isLoading || isPending) {
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
        title={"Failed to load reported users"}
        description={errorMessage}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <DashboardHeader
        title={
          <div className="w-full flex items-center justify-center gap-2 bg-primary/20 p-4">
            <h1 className="font-semibold text-lg md:text-xl">
              Reported Profiles
            </h1>
          </div>
        }
      />
      {isPaid.paid ? (
        <div className="flex flex-1 flex-col p-4 gap-2">
          {reportedUsers?.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-1">
              <Info className="w-12 h-12 bg-card p-2 rounded-full" />
              <h1 className="font-semibold text-xl">No Reported Users</h1>
              <p className="text-muted-foreground">
                We could not find any reported users
              </p>
            </div>
          ) : (
            <div>
              {reportedUsers &&
                reportedUsers?.map((reportedUser) => (
                  <Link
                    href={"/users/reported-users/" + reportedUser.id}
                    key={reportedUser.id}
                  >
                    <div className="flex items-center justify-between gap-4 border shadow-md rounded-xl bg-card p-4">
                      <div className="flex items-center gap-4 w-full">
                        <Avatar className={"size-14"}>
                          <AvatarImage
                            src={
                              reportedUser?.reportedAgainst?.avatar
                                ? reportedUser?.reportedAgainst?.avatar
                                : reportedUser?.reportedAgainst?.gender ===
                                  "MALE"
                                ? "/groom.webp"
                                : "/bride.webp"
                            }
                            alt={reportedUser.id}
                            className="object-cover"
                          />
                          <AvatarFallback>
                            {reportedUser.reportedAgainst.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="w-full flex flex-col">
                          <div className="flex items-center justify-between">
                            <h1 className="text-lg md:text-xl lg:text-2xl">
                              {reportedUser.reportedAgainst.title}{" "}
                              {reportedUser.reportedAgainst.lastName}
                            </h1>
                            <div
                              className={`flex items-center rounded-full text-xs px-2 py-0.5 font-semibold text-white ${
                                reportedUser.status === "PENDING"
                                  ? " bg-orange-600"
                                  : reportedUser.status === "ACCEPTED"
                                  ? " bg-green-600"
                                  : " bg-destructive"
                              }`}
                            >
                              <span>{reportedUser.status}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Reported on{" "}
                            {format(
                              new Date(reportedUser.createdAt),
                              "dd-MM-yyyy"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col p-4">
          <PlansSection
            showFreeSection={isPaid.reason === NotPaidUserReason.FREE_USER}
            showPlanExpiredSection={
              isPaid.reason === NotPaidUserReason.PLAN_EXPIRED
            }
            userType={userType}
            isPending={isPending}
          />
        </div>
      )}
    </div>
  );
}
