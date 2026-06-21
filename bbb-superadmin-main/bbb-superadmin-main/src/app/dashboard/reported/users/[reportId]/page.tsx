export const dynamic = "force-dynamic";

import { getReportedUserById } from "@/action/reported";
import { EpmptyList } from "@/components/emptyList";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Flag } from "lucide-react";
import Image from "next/image";
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
  const report = await getReportedUserById(reportId);

  return (
    <div className="flex flex-1 flex-col gap-3 p-4">
      <h1 className="p-5 text-lg font-bold md:text-xl lg:text-2xl">
        Reported User
      </h1>
      {report ? (
        <div className="border-border flex max-w-lg flex-col gap-3 rounded-md border p-5">
          <Link
            href={`/dashboard/profile/user/${report.reportedAgainst.id}`}
            className="flex gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold">
                {report.reportedAgainst.title}{" "}
                {report.reportedAgainst.firstName}{" "}
                {report.reportedAgainst.middleName}{" "}
                {report.reportedAgainst.lastName}
              </div>
              <p className="text-muted-foreground text-sm">
                +91 {report.reportedAgainst.phone}
              </p>
              {/* <Badge
                className={`mt-1 rounded-full ${
                  report.reportedAgainst.blocked ? "bg-red-600" : "bg-green-600"
                }`}
              >
                {report.reportedAgainst.blocked ? "Blocked" : "Active"}
              </Badge> */}
            </div>
          </Link>

          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm">Reason</span>
              <p className="text-base">{report.reason}</p>
            </div>

            {/* Reporter Info */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Reported By</span>
              <Link href={`/dashboard/profile/user/${report.reporter.id}`}>
                <Badge variant="secondary">
                  {report.reporter.firstName} {report.reporter.middleName}{" "}
                  {report.reporter.lastName}
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

            {/* Screenshot */}
            {report.screenShotUrl && (
              <div>
                <span className="text-muted-foreground text-sm">
                  Screenshot
                </span>
                <Image
                  src={report.screenShotUrl}
                  width={400}
                  height={300}
                  alt="Report Screenshot"
                  className="mt-1 min-h-48 w-full rounded-lg border object-cover shadow-sm"
                />
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
