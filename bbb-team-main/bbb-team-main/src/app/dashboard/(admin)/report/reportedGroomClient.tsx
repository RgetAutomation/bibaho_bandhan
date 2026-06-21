"use client";

import { getReportedGroom } from "@/actions/getReportedUsers";
import ApiErrorPage from "@/components/apiErrorPage";
import LoadingPage from "@/components/loader";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ContentNotFound from "@/components/contentNotFound";
import Link from "next/link";

export default function ReportedGroomClient() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["getAllReportedGrooms"],
    queryFn: () => getReportedGroom(),
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
      ? error.response?.data?.message || "Failed to load reported grooms"
      : "Something went wrong. Please try again later.";
    return (
      <ApiErrorPage
        title={"Failed to load grooms"}
        description={errorMessage}
      />
    );
  }

  return (
    <div className="flex h-screen flex-1 flex-col md:min-h-min">
      <h1 className="border-b px-5 py-5 text-lg font-bold md:text-xl lg:text-2xl">
        Reported Grooms
      </h1>
      {data && data.length > 0 ? (
        <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((report) => (
            <Link key={report.id} href={`/dashboard/report/${report.id}`}>
              <Card
                key={report.id}
                className="rounded-2xl shadow-sm transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between">
                    {/* Avatar + Info */}
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={
                            report.user.avatar
                              ? report.user.avatar
                              : "/groom.webp"
                          }
                          alt={report.user.title}
                        />
                        <AvatarFallback>
                          {report.user?.lastName?.charAt(0) ?? "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="ml-4 flex flex-col items-start">
                        <CardTitle className="text-lg font-semibold">
                          {report.user.title} {report.user.lastName}
                        </CardTitle>

                        <p className="text-muted-foreground text-sm">
                          {report.user.type} Plan
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium",
                        report.status === "PENDING" &&
                          "border-yellow-500 text-yellow-500",
                        report.status === "RESOLVED" &&
                          "border-green-600 text-green-600",
                        report.status === "REJECTED" &&
                          "border-red-600 text-red-600"
                      )}
                    >
                      {report.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Reason:</p>
                    <p className="text-muted-foreground line-clamp-3 text-sm">
                      {report.reason}
                    </p>
                  </div>

                  {report.reply && (
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Reply:</p>
                      <p className="text-muted-foreground line-clamp-3 text-sm">
                        {report.reply}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-[10%] flex items-center justify-center">
          <ContentNotFound
            title={"Reported Grooms not found"}
            description={
              "We couldn't find any reported matching grooms. Please try again later."
            }
          />
        </div>
      )}
    </div>
  );
}
