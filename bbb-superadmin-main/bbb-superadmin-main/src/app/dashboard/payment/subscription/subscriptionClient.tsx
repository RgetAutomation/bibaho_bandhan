"use client";

import { ISubscribedPayments } from "@/components/interface/IPayments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { EpmptyList } from "@/components/emptyList";
import Link from "next/link";
import { PaymentStatus } from "@/components/enum/paymentStatus";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { formatNumberTwoDecimal } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ITeamsForPayment } from "@/components/interface/ITeam";

export default function SubscriptionClient({
  payments,
  total,
  totalPages,
  currentPage,
  teamId,
  teams,
}: {
  payments: ISubscribedPayments[];
  total: number;
  totalPages: number;
  currentPage: string | undefined;
  teamId: string | undefined;
  teams: ITeamsForPayment[];
}) {
  const router = useRouter();
  const page = Number(currentPage ?? 1);
  //const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState<string>(teamId ?? "all");

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("sortBy", sortBy);

      if (selectedTeam !== "all") {
        params.set("teamId", selectedTeam);
      }

      router.push(`?${params.toString()}`);
    }, 100);

    return () => clearTimeout(timer);
  }, [router, sortBy, page, selectedTeam]);

  const goToPage = (p: number) => {
    const params = new URLSearchParams();

    params.set("page", String(p));
    params.set("sortBy", sortBy);

    if (selectedTeam !== "all") {
      params.set("teamId", selectedTeam);
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-card flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6">
        {/* Title + Avatar */}
        <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
          Subscription Payment ({total})
        </h1>

        {/* Search + Sort */}
        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          {/* <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full md:w-72"
          /> */}

          {teams?.length > 0 && (
            <Select
              value={selectedTeam}
              onValueChange={(value) => {
                setSelectedTeam(value);
              }}
            >
              <SelectTrigger className="w-full md:w-50">
                <SelectValue placeholder="Select Admin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key={"all"} value={"all"}>
                  <div className="flex items-center gap-1">
                    <Avatar className="mr-2 size-6">
                      <AvatarImage src={"/groom.webp"} alt={"all admin"} />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <span>All</span>
                  </div>
                </SelectItem>
                <SelectItem key={"user"} value={"user"}>
                  <div className="flex items-center gap-1">
                    <Avatar className="mr-2 size-6">
                      <AvatarImage src={"/groom.webp"} alt={"direct-user"} />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <span>Direct User</span>
                  </div>
                </SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-1">
                      <Avatar className="mr-2 size-6">
                        <AvatarImage
                          src={team.avatar ?? "/groom.webp"}
                          alt={team.id}
                        />
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      <span>
                        {" "}
                        {[team.firstName, team.middleName, team.lastName].join(
                          " "
                        )}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select onValueChange={setSortBy} defaultValue="all">
            <SelectTrigger className="w-full md:w-50">
              <SelectValue placeholder="Select Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status Payment</SelectItem>
              <SelectItem value="pending">Pending Payment</SelectItem>
              <SelectItem value="approved">Approved Payment</SelectItem>
              <SelectItem value="rejected">Rejected Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <EpmptyList
            title="No Payment Found"
            subtitle="No payment found here. Please add some data to get started."
          />
        </div>
      ) : (
        <div
          className={"flex w-full flex-1 flex-col items-center justify-between"}
        >
          <div className="grid w-full grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
            {payments.map((payment) => (
              <Link
                href={`/dashboard/payment/subscription/${payment.id}`}
                key={payment.id}
              >
                <SubscriptionPaymentCard payments={payment} key={payment.id} />
              </Link>
            ))}
          </div>
          {payments && total > 9 && (
            <Pagination>
              <PaginationContent>
                {/* Previous */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) {
                        goToPage(page - 1);
                      }
                    }}
                  />
                </PaginationItem>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={page === pageNum}
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(pageNum);
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {/* Next */}
                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) {
                        goToPage(page + 1);
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}

function SubscriptionPaymentCard({
  payments,
}: {
  payments: ISubscribedPayments;
}) {
  return (
    <Card className="w-full max-w-md rounded-2xl border shadow-md">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage
            src={payments.user?.avatar ? payments.user.avatar : "/groom.webp"}
          />
          <AvatarFallback>
            {payments.user.firstName[0]}
            {payments.user.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle className="text-lg font-semibold">
            {payments.user.title} {payments.user.firstName}{" "}
            {payments.user.lastName}
          </CardTitle>
          <span className="text-muted-foreground text-sm">
            {format(new Date(payments.createdAt || new Date()), "dd MMM yyyy")}
          </span>
          {/* <p className="text-sm text-muted-foreground">{payments.user.email}</p> */}
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        {/* Amount */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Amount</span>
          <div className="flex items-center gap-1 text-sm font-bold">
            <IndianRupee className="h-4 w-4" />{" "}
            {formatNumberTwoDecimal(Number(payments.plan.price))}
          </div>
        </div>

        {/* Payment Date */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Made By</span>
          <div className="flex items-center gap-1">
            <Avatar className="h-5 w-5">
              <AvatarImage
                src={
                  payments.team?.avatar
                    ? payments.team.avatar
                    : payments.team?.gender === "MALE"
                      ? "/groom.webp"
                      : "/groom.webp"
                }
              />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold">
              {payments.team
                ? [
                    payments.team?.firstName,
                    payments.team?.middleName,
                    payments.team?.lastName,
                  ].join(" ")
                : "Individual"}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <Badge
            variant="outline"
            className={`${
              payments.status === PaymentStatus.PENDING
                ? "border-yellow-500 text-yellow-500"
                : payments.status === PaymentStatus.APPROVED
                  ? "border-green-600 text-green-600"
                  : "border-red-600 text-red-600"
            } rounded-2xl`}
          >
            {payments.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
