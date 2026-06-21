"use client";

import { EpmptyList } from "@/components/emptyList";
import { IReportedTeam } from "@/components/interface/IReportedUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Reply } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function TeamReportedUserClient({
  reports,
}: {
  reports: IReportedTeam[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return reports;
    return reports.filter(
      (report) =>
        report.user.firstName.toLowerCase().includes(query.toLowerCase()) ||
        report.user.phone?.toLowerCase().includes(query.toLowerCase()) ||
        report.user.lastName?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, reports]);

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="bg-card flex w-full flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6">
        <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
          Team Reported Users
        </h1>
        <Input
          placeholder="Search user..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-64"
        />
      </div>
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((report) => (
            <ReportedUserCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <EpmptyList title="No Reported Users Found" />
        </div>
      )}
    </div>
  );
}

function ReportedUserCard({ report }: { report: IReportedTeam }) {
  return (
    <div className="group bg-background relative w-full max-w-md overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Header */}
      <Link
        href={`/dashboard/profile/user/${report.user.id}`}
        className="hover:bg-muted/40 flex items-center gap-3 border-b px-5 py-4 transition-colors"
      >
        <Avatar className="size-12 border">
          <AvatarImage
            src={
              report.user.avatar
                ? report.user.avatar
                : report.user.gender === "MALE"
                  ? "/groom.webp"
                  : "/bride.webp"
            }
          />
          <AvatarFallback>{report.user.firstName?.[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <p className="text-sm leading-tight font-semibold">
            {report.user.title} {report.user.firstName} {report.user.middleName}{" "}
            {report.user.lastName}
          </p>
          <p className="text-muted-foreground text-xs">
            +91 {report.user.phone}
          </p>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            report.status === "PENDING" && "border-yellow-500 text-yellow-500",
            report.status === "RESOLVED" && "border-green-600 text-green-600",
            report.status === "REJECTED" && "border-red-600 text-red-600"
          )}
        >
          {report.status}
        </Badge>
      </Link>

      {/* Body */}
      <div className="space-y-4 px-5 py-4">
        {/* Reason */}
        <div className="bg-muted/30 rounded-xl border p-3">
          <p className="text-muted-foreground mb-1 text-[11px] font-medium tracking-wider uppercase">
            Report Reason
          </p>
          <p className="text-sm leading-relaxed italic">“{report.reason}”</p>
        </div>

        {/* Reporter */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Reported by</span>
          <Link
            href={`/dashboard/profile/team/${report.team.id}`}
            className="hover:underline"
          >
            <Badge
              variant="outline"
              className="rounded-full p-1 px-2 font-normal"
            >
              <div className="flex items-center gap-0.5">
                <Avatar className="size-5 border">
                  <AvatarImage
                    src={
                      report.team.avatar
                        ? report.team.avatar
                        : report.team.gender === "MALE"
                          ? "/groom.webp"
                          : "/bride.webp"
                    }
                  />
                  <AvatarFallback>{report.team.firstName?.[0]}</AvatarFallback>
                </Avatar>

                <span>
                  {report.team.firstName} {report.team.middleName}{" "}
                  {report.team.lastName}
                </span>
              </div>
            </Badge>
          </Link>
        </div>

        {/* Date */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Created at</span>
          <span className="font-medium">
            {format(new Date(report.createdAt), "dd MMM yyyy, hh:mm a")}
          </span>
        </div>

        {/* Reply */}
        <div className="flex items-start justify-between gap-3 pt-2">
          <div className="flex-1 text-sm">
            {report.reply ? (
              <>
                <span className="text-muted-foreground">Admin reply:</span>
                <p className="leading-relaxed italic">“{report.reply}”</p>
              </>
            ) : (
              <p className="text-muted-foreground italic">No reply yet</p>
            )}
          </div>

          <Button size="sm" variant="outline" asChild className="shrink-0">
            <Link href={`/dashboard/reported/team/${report.id}`}>
              <Reply className="mr-1 h-4 w-4" />
              Reply
            </Link>
          </Button>
        </div>
      </div>

      {/* Accent bar */}
      <div className="bg-primary/70 absolute top-0 left-0 h-1 w-full opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
