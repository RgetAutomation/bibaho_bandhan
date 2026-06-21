export const dynamic = "force-dynamic";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import {
  Flag,
  LucideIcon,
  UsersRound,
  UserStar,
  Notebook,
  UserRoundPen,
  UserRoundX,
  Blend,
} from "lucide-react";
import { UserJoinAndPaymentChart } from "./dashboardClient";
import { getDashboardCounts } from "@/action/dashboard";
import { format } from "date-fns";
import React from "react";
import {
  IDashboardGhotokJoinRequest,
  IDashboardPlans,
  IDashboardReportedUser,
  IDashboardTeamProfileRequest,
} from "@/components/interface/IDahboard";
import { formatRupees } from "@/lib/utils";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function DashboardHome() {
  await checkAuthAndGetSession(await headers());
  const data = await getDashboardCounts();
  return (
    <main className="grid gap-6 p-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <StatCard
          title="Active Plans"
          value={data.plansCount}
          icon={Notebook}
          accent="from-emerald-200 dark:from-emerald-900 to-white dark:to-emerald-900/10"
        />
        <StatCard
          title="Total Admins"
          value={data.admin}
          icon={UserStar}
          accent="from-sky-200 dark:from-sky-900 to-white dark:to-sky-900/10"
        />
        <StatCard
          title="Total Moderators"
          value={data.moderator}
          icon={UserRoundPen}
          accent="from-fuchsia-200 dark:from-fuchsia-900 to-white dark:to-fuchsia-900/10"
        />
        <StatCard
          title="Total Ghotoks"
          value={data.ghotok}
          icon={Blend}
          accent="from-violet-200 to-white dark:to-violet-900/10 dark:from-violet-900"
        />
        <StatCard
          title="Total Brides"
          value={data.bride}
          icon={UsersRound}
          accent="from-rose-200 dark:from-rose-900 to-white dark:to-rose-900/10"
        />
        <StatCard
          title="Total Grooms"
          value={data.groom}
          icon={UsersRound}
          accent="from-blue-200 dark:from-blue-900 to-white dark:to-blue-900/10"
        />
        <StatCard
          title="Expired Plan Users"
          value={data.expireUsersCount}
          icon={UserRoundX}
          accent="from-amber-200 to-white dark:to-amber-900/10 dark:from-amber-900"
        />
        <StatCard
          title="Reported Users"
          value={data.reportedCount}
          icon={Flag}
          accent="from-red-200 to-white dark:to-red-900/10 dark:from-red-900"
        />
      </div>

      {/* Charts */}
      <UserJoinAndPaymentChart
        joinData={data.userJoinData}
        paymentStatus={data.paymentStatus}
      />

      {/* Quick Lists */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Recent Subscription Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentPayments.map((p) => (
                <div
                  key={p.user.publicId + p.createdAt}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={p.user.avatar} />
                      <AvatarFallback>
                        {p.user.firstName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {p.user.title} {p.user?.firstName} {p.user.middleName}{" "}
                        {p.user.lastName}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {format(p.createdAt, "dd MMM yyyy")} • {p.user.publicId}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatRupees(Number(p.plan.price))}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {p.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Recent Matching Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.matchingPayments.map((p) => (
                <div
                  key={p.user.publicId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={p.user.avatar} />
                      <AvatarFallback>
                        {p.user.firstName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {p.user.title} {p.user.firstName} {p.user.middleName}{" "}
                        {p.user.lastName}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {format(p.createdAt, "dd MMM yyyy")} • {p.user.publicId}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatRupees(Number(p.amount))}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {p.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests & Reports */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <RecentList
          title="Profile Requests"
          items={data.teamProfileRequests}
          renderItem={(it: IDashboardTeamProfileRequest) => (
            <>
              <div>
                <div className="font-medium">
                  {it.team.firstName} {it.team.middleName} {it.team.lastName}
                </div>
                <div className="text-muted-foreground text-xs">
                  {it.team.role} • {format(it.createdAt, "dd-MM-yyyy")}
                </div>
              </div>
              {/* <div className="flex items-center gap-2">
                <Button size="sm">View</Button>
                <Button size="sm" variant="ghost">
                  Approve
                </Button>
              </div> */}
            </>
          )}
        />

        <RecentList
          title="Ghotok Requests"
          items={data.ghotokJoinRequest}
          renderItem={(it: IDashboardGhotokJoinRequest) => (
            <>
              <div>
                <div className="font-medium">
                  {it.firstName} {it.middleName} {it.lastName}
                </div>
                <div className="text-muted-foreground text-xs">
                  +91-{it.phone}
                </div>
              </div>
              {/* <div className="flex items-center gap-2">
                <Button size="sm">View</Button>
                <Button size="sm" variant="ghost">
                  Accept
                </Button>
              </div> */}
            </>
          )}
        />

        <RecentList
          title="Reported Users"
          items={data.reportedUsers}
          renderItem={(it: IDashboardReportedUser) => (
            <>
              <div>
                <div className="font-medium">
                  {it.reportedAgainst.firstName} {it.reportedAgainst.middleName}{" "}
                  {it.reportedAgainst.lastName}
                </div>
                <div className="text-muted-foreground text-xs">{it.reason}</div>
              </div>
              {/* <div className="flex items-center gap-2">
                <Button size="sm" variant="destructive">
                  Action
                </Button>
              </div> */}
            </>
          )}
        />
      </div>

      {/* Feedback Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Active Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.activePlans.map((r: IDashboardPlans) => (
                <li key={r.id} className="flex items-start gap-3">
                  <div>
                    <div className="font-medium">
                      {r.title} —{" "}
                      <Badge className="rounded-full">
                        {formatRupees(Number(r.price))}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-0.5 text-sm">
                      Duration : {r.duration}
                      {/* • Connection : {r.connection} */}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Public Feedbacks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.publicFeedback.map((f) => (
                <li key={f.id} className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {f.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {f.name} — {"★".repeat(Number(f.rating))}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {f.feedback}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Footer quick actions */}
      {/* <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Last updated: Sep 28, 2025
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">Export CSV</Button>
          <Button size="sm" variant="outline">
            Sync Data
          </Button>
        </div>
      </div> */}
    </main>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <div className="bg-card rounded-2xl border p-1 shadow">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div
            className={`rounded-lg bg-gradient-to-tr p-2 ${
              accent || "from-sky-100 to-white"
            }`}
          >
            <Icon className="size-5 md:size-6" />
          </div>

          <div>
            <p className="text-muted-foreground text-xs">{title}</p>
            <h3 className="text-lg font-semibold">{value}</h3>
          </div>
        </div>
        {/* <Button size="sm" variant="ghost">
          View
        </Button> */}
      </div>
    </div>
  );
}

function RecentList<T>({
  title,
  items,
  renderItem,
}: {
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {items.length > 0 && (
            <Badge className="rounded-full font-bold">{items.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <ul className="flex flex-1 flex-col gap-3">
          {items.length > 0 ? (
            items.map((it: T, i) => (
              <li key={i} className="flex items-center justify-between">
                {renderItem(it)}
              </li>
            ))
          ) : (
            <div className="flex w-full flex-1 items-center justify-center">
              <p className="text-muted-foreground text-sm">
                No {title.toLowerCase()} found.
              </p>
            </div>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
