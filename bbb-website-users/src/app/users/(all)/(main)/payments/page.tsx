"use client";

import { getAllPayments } from "@/actions/payments";
import ApiErrorPage from "@/components/apiErrorPage";
import DashboardHeader from "@/components/dashboard/header";
import { IPaymentHistory } from "@/components/interface/IPaymentHistory";
import LoadingPage from "@/components/loader";
import { cn, formatINR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { format } from "date-fns";
import { CheckCircle2, CreditCard, XCircle } from "lucide-react";
import Link from "next/link";

export default function AllPaymentList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["paymentHistory"],
    queryFn: () => getAllPayments(),
  });

  if (isLoading) {
    return (
      <div className={"flex flex-col flex-1"}>
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load payment history"
      : "Something went wrong";
    return (
      <div className={"flex flex-col flex-1"}>
        <ApiErrorPage
          title="Failed to load payment history"
          description={errorMessage}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-1px)]">
      <DashboardHeader
        title={
          <div className="w-full flex items-center justify-center gap-2 bg-primary/20 p-4">
            <h1 className="font-semibold text-lg md:text-xl">
              Payment History
            </h1>
          </div>
        }
      />

      <div className="flex flex-col flex-1 gap-2 p-4  overflow-y-auto">
        {data?.length === 0 ? (
          <div className="flex flex-col flex-1 items-center justify-center p-4">
            <h1 className="font-semibold text-lg md:text-xl">No Payment</h1>
          </div>
        ) : (
          data?.map((payment) => (
            <Link
              className="w-full"
              key={payment.id}
              href={`/users/payments/${payment.id}/status`}
            >
              <PaymentCard payment={payment} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function PaymentCard({ payment }: { payment: IPaymentHistory }) {
  const isSuccess = payment.status?.toUpperCase() === "APPROVED";
  const isFailed = payment.status?.toUpperCase() === "REJECTED";

  return (
    <div className="w-full p-4 rounded-2xl border bg-gradient-to-br from-card to-muted/50 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-foreground">
            {payment.planTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(payment.createdAt, "dd MMM yyyy")}
          </p>
        </div>

        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
            isSuccess && "bg-green-100 text-green-600 dark:bg-green-800/20",
            isFailed && "bg-red-100 text-red-600 dark:bg-red-800/10",
            !isSuccess &&
              !isFailed &&
              "bg-gray-100 text-muted-foreground dark:bg-gray-800/20",
          )}
        >
          {isSuccess && <CheckCircle2 size={14} />}
          {isFailed && <XCircle size={14} />}
          {payment.status}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CreditCard size={16} />
          <span className="text-sm capitalize">{payment.paymentType}</span>
        </div>

        <div className="text-right">
          <h2 className="text-xl font-bold text-primary">
            {formatINR(Number(payment.planPrice || 0))}
          </h2>
        </div>
      </div>
    </div>
  );
}
