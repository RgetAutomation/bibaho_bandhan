"use client";

import { getAllPayments } from "@/actions/payments";
import ApiErrorPage from "@/components/apiErrorPage";
import LoadingPage from "@/components/loader";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import ContentNotFound from "@/components/contentNotFound";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IPayments, IPaymentsWithPrice } from "@/components/interface/IPayment";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaymentStatus } from "@/components/enum/PaymentStatus";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatRupees } from "@/lib/utils";

export default function PaymentsClientPage() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("all");

  useEffect(() => {
    setPage(1);
  }, [sortBy]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["getAllPayments", page, sortBy],
    queryFn: () => getAllPayments(page, 9, sortBy),
    placeholderData: keepPreviousData,
  });

  const payments = data?.data as IPaymentsWithPrice[];
  const pagination = data;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load payments"
      : "Something went wrong. Please try again later.";
    return (
      <ApiErrorPage
        title={"Failed to load payments"}
        description={errorMessage}
      />
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col md:min-h-min">
      <div className="bg-card flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6">
        {/* Title + Avatar */}
        <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
          Subscription Payment ({pagination?.totalData})
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
      {payments?.length === 0 ? (
        <div className="flex min-h-screen w-full flex-1 items-center justify-center md:min-h-min">
          <ContentNotFound
            title={"No Payments Found"}
            description={
              "We couldn't find any payments at the moment. Please check back later."
            }
          />
        </div>
      ) : (
        <div
          className={
            "flex w-full flex-1 flex-col items-center justify-between p-5"
          }
        >
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {payments.map((payment: IPaymentsWithPrice) => (
              <Link key={payment.id} href={`/dashboard/payments/${payment.id}`}>
                <PaymentCard payment={payment} />
              </Link>
            ))}
          </div>

          {pagination && pagination.totalData > 0 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.currentPage > 1) {
                        setPage((prev) => prev - 1);
                      }
                    }}
                  />
                </PaginationItem>

                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={pagination.currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.currentPage < pagination.totalPages) {
                        setPage((prev) => prev + 1);
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

function PaymentCard({ payment }: { payment: IPaymentsWithPrice }) {
  return (
    <Card className="w-full max-w-sm shadow-md transition hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={payment.user.gender === "MALE" ? "/groom.webp" : "/bride.webp"}
            alt={`${payment.user.title} ${payment.user.lastName}`}
          />
          <AvatarFallback>{payment.user.lastName[0]}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <CardTitle className="text-base font-semibold">
            {payment.user.title} {payment.user.lastName}
          </CardTitle>
          {/* <span className="text-muted-foreground flex gap-0.5 text-xs">
            <Hash size={14} /> {payment.user.publicId}
          </span> */}
          <span className="text-muted-foreground flex gap-0.5 text-xs">
            {formatDistanceToNow(new Date(payment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-bold">
            {formatRupees(Number(payment.plan.price))}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Status:</span>
          <Badge
            variant="outline"
            className={`${
              payment.status === PaymentStatus.PENDING
                ? "border-yellow-500 text-yellow-500"
                : payment.status === PaymentStatus.APPROVED
                  ? "border-green-600 text-green-600"
                  : "border-red-600 text-red-600"
            } rounded-2xl`}
          >
            {payment.status}
          </Badge>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Created:</span>
          <span>{format(new Date(payment.createdAt), "dd MMM yyyy")}</span>
        </div>
      </CardContent>
    </Card>
  );
}
