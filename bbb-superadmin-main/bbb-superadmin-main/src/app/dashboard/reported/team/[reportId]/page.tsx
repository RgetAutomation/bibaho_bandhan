export const dynamic = "force-dynamic";

import { getReportedTeamById } from "@/action/reported";
import { EpmptyList } from "@/components/emptyList";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Flag } from "lucide-react";
import Link from "next/link";
import React from "react";
import ReportedUserClient from "./reportedUserClient";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function ReportedUser({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { reportId } = await params;
  const report = await getReportedTeamById(reportId);

  return (
    <div className="flex flex-1 flex-col gap-3 p-4">
      <h1 className="p-4 text-lg font-bold md:text-xl lg:text-2xl">
        Reported User By Team
      </h1>
      {report ? (
        <div className="flex max-w-lg flex-col rounded-lg border border-b">
          <Link
            href={`/dashboard/profile/user/${report.user.id}`}
            className="flex gap-3 border-b p-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold">
                {report.user.title} {report.user.firstName}{" "}
                {report.user.middleName} {report.user.lastName}
              </div>
              <p className="text-muted-foreground text-sm">
                +91 {report.user.phone}
              </p>
            </div>
          </Link>

          <div className="flex flex-col gap-4 p-5">
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm">Reason</span>
              <p className="text-base">{report.reason}</p>
            </div>

            {/* Reporter Info */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Reported By</span>
              <Link href={`/dashboard/profile/team/${report.team.id}`}>
                <Badge variant="secondary">
                  {report.team.firstName} {report.team.middleName}{" "}
                  {report.team.lastName}
                </Badge>
              </Link>
            </div>

            {/* Dates */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Reported At</span>
              <span>
                {format(new Date(report.createdAt), "dd MMM yyyy, hh:mm a")}
              </span>
            </div>

            {report.reply && (
              <div className="flex items-center justify-between gap-5">
                <span className="text-muted-foreground">Your reply</span>
                <p className="text-end leading-relaxed italic">
                  “{report.reply}”
                </p>
              </div>
            )}
          </div>

          {/* Actions */}

          <ReportedUserClient reportId={report.id} />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <EpmptyList title="No Users Found" />
        </div>
      )}
    </div>
  );
}
