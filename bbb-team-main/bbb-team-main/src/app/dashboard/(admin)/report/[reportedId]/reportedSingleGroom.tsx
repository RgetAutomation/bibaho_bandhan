"use client";

import { getSingleReportedGroom } from "@/actions/getReportedUsers";
import ApiErrorPage from "@/components/apiErrorPage";
import LoadingPage from "@/components/loader";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Clock, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ReportedSingleGroom({ userId }: { userId: string }) {
  const {
    data: report,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["getSingleReportedGroom", userId],
    queryFn: () => getSingleReportedGroom(userId),
    placeholderData: keepPreviousData,
    enabled: !!userId,
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
        title={"Failed to load report"}
        description={errorMessage}
      />
    );
  }

  console.log("data", report);

  return (
    <Card className="m-4 max-w-xl rounded-2xl shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="text-muted-foreground h-5 w-5" />
          <h2 className="text-lg font-semibold">User Report</h2>
        </div>
        <Badge variant="outline" className="border-yellow-400 text-yellow-600">
          {report?.status}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={report?.user.avatar ? report.user.avatar : "/groom.webp"}
              alt={report?.user.title}
            />
            <AvatarFallback>
              {report?.user?.lastName?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {report?.user.title} {report?.user.lastName}
            </p>
            <p className="text-muted-foreground text-sm">
              {report?.user.type} PLAN
            </p>
          </div>
        </div>

        <Separator />

        {/* Report Reason */}
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium">
            Report Reason
          </p>
          <p className="text-sm leading-relaxed">{report?.reason}</p>
        </div>

        {/* Report Reply */}
        {report?.reply && (
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">
              Report Reply
            </p>
            <p className="text-sm leading-relaxed">{report?.reply}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Clock className="h-4 w-4" />
          {report?.createdAt && (
            <p>Submitted on {new Date(report.createdAt).toLocaleString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
