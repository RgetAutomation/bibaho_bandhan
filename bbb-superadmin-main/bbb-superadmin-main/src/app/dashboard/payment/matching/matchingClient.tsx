"use client";

import {
  IMatchingPayments,
  IMatchingPaymentsWithGender,
} from "@/components/interface/IPayments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { EpmptyList } from "@/components/emptyList";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PaymentStatus } from "@/components/enum/paymentStatus";
import { formatNumberTwoDecimal } from "@/lib/utils";

export default function MatchingClient({
  payments,
}: {
  payments: IMatchingPaymentsWithGender[];
}) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // Filter + Sort combined
  const filteredAndSorted = useMemo(() => {
    let filtered = payments;

    // 1️⃣ Filter by search query
    if (query) {
      filtered = filtered.filter(
        (b) =>
          b.user.firstName.toLowerCase().includes(query.toLowerCase()) ||
          (b.user.phone?.toLowerCase().includes(query.toLowerCase()) ?? false)
      );
    }

    // 2️⃣ Sort filtered results
    return [...filtered].sort((a, b) => {
      if (sortBy === "name-asc")
        return a.user.firstName.localeCompare(b.user.firstName);
      if (sortBy === "name-desc")
        return b.user.firstName.localeCompare(a.user.firstName);
      return 0;
    });
  }, [payments, query, sortBy]);

  return (
    <div className="flex flex-1 flex-col space-y-3 md:space-y-4 lg:space-y-6">
      <div className="bg-card flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6 lg:p-8">
        {/* Title + Avatar */}
        <h1 className="text-xl font-bold text-gray-800 md:text-2xl lg:text-3xl dark:text-gray-100">
          Matching payments
        </h1>

        {/* Search + Sort */}
        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full md:w-72"
          />
          <Select onValueChange={setSortBy} defaultValue="name-asc">
            <SelectTrigger className="w-full md:w-60">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A–Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z–A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 md:p-4 lg:grid-cols-3">
          {filteredAndSorted.map((payment) => (
            <Link
              href={`/dashboard/payment/matching/${payment.id}`}
              key={payment.id}
            >
              <MatchingPaymentCard payments={payment} key={payment.id} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-4">
          <EpmptyList
            title="No Matching Payment Found"
            subtitle="No payment found here. Please add some data to get started."
          />
        </div>
      )}
    </div>
  );
}

function MatchingPaymentCard({ payments }: { payments: IMatchingPayments }) {
  const isPending = payments.status === PaymentStatus.PENDING;
  const isApproved = payments.status === PaymentStatus.APPROVED;

  return (
    <div className="group bg-background relative w-full max-w-md overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Status Accent */}
      <div
        className={`absolute top-0 left-0 h-full w-0.5 ${
          isPending
            ? "bg-yellow-400"
            : isApproved
              ? "bg-green-500"
              : "bg-red-500"
        }`}
      />

      {/* Header */}
      <div className="flex items-center gap-4 border-b px-5 py-4">
        <Avatar className="h-12 w-12 border">
          <AvatarImage
            src={
              payments.user?.avatar
                ? payments.user.avatar
                : payments.user.gender === "MALE"
                  ? "/groom.webp"
                  : "/bride.webp"
            }
          />
          <AvatarFallback>
            {payments.user.firstName[0]}
            {payments.user.lastName[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <p className="text-sm leading-tight font-semibold">
            {payments.user.title} {payments.user.firstName}{" "}
            {payments.user.lastName}
          </p>
          <p className="text-muted-foreground text-xs">
            +91 {payments.user.phone}
          </p>
        </div>

        {/* Status Badge */}
        <Badge
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isPending
              ? "bg-yellow-100 text-yellow-800"
              : isApproved
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {payments.status}
        </Badge>
      </div>

      {/* Body */}
      <div className="space-y-4 px-5 py-4">
        {/* Amount Highlight */}
        <div className="bg-muted/30 flex items-center justify-between rounded-xl border p-4">
          <span className="text-muted-foreground text-sm">Payment Amount</span>
          <div className="flex items-center gap-1 text-lg font-bold text-green-500">
            <IndianRupee className="h-5 w-5" />
            {formatNumberTwoDecimal(Number(payments.amount))}
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex w-full items-center justify-between">
          <p className="text-muted-foreground mb-1">Payment Date :</p>
          <p className="font-medium">
            {format(new Date(payments.createdAt || new Date()), "dd MMM yyyy")}
          </p>
        </div>
      </div>
    </div>
  );
}
