"use client";

import { getMatchingPaymentDetailsByMessageId } from "@/actions/ghotok";
import ApiErrorPage from "@/components/apiErrorPage";
import LoadingPage from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatRupees } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { format, formatDistanceToNow } from "date-fns";
import {
  BadgeCheck,
  CalendarDays,
  Camera,
  ChevronLeftIcon,
  IndianRupee,
  UserRound,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SuccessPaymentClient({
  messageId,
}: {
  messageId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["getMatchingPaymentDetailsByMessageId", messageId],
    queryFn: () => getMatchingPaymentDetailsByMessageId(messageId!),
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load payment status details"
      : "Something went wrong";
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center overflow-y-auto">
        <ApiErrorPage
          title={"Failed to payment status"}
          description={errorMessage}
        />
      </div>
    );
  }

  function handleBack() {
    //if (pageStatus && pageStatus === "1") return router.push("/users/account");
    router.replace("/users/matching");
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col space-y-4 p-4">
        {/* ✅ SUCCESS MESSAGE */}
        {data?.status === "PENDING" && (
          <div className="flex items-start gap-4 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-5 shadow-sm dark:from-green-900/30 dark:to-green-800/20">
            <div className="flex items-center justify-center rounded-full bg-green-100 p-2 dark:bg-green-800">
              <BadgeCheck
                className="text-green-600 dark:text-green-300"
                size={22}
              />
            </div>

            <div className="flex flex-col">
              <span className="text-lg font-semibold text-green-800 md:text-xl dark:text-green-200">
                Thank you! 🎉
              </span>

              <p className="mt-1 text-sm leading-relaxed text-green-700 md:text-base dark:text-green-300">
                Your screenshot has been successfully submitted. <br />
                Verification is in progress (1–24 hours). <br />
                Your account will be activated once approved.
              </p>
            </div>
          </div>
        )}

        {/* ✅ APPROVED MESSAGE */}
        {data?.status === "APPROVED" && (
          <div className="flex items-start gap-4 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-5 shadow-sm dark:from-green-900/30 dark:to-green-800/20">
            <div className="flex items-center justify-center rounded-full bg-green-100 p-2 dark:bg-green-800">
              <BadgeCheck
                className="text-green-600 dark:text-green-300"
                size={22}
              />
            </div>

            <div className="flex flex-col">
              <span className="text-lg font-semibold text-green-800 md:text-xl dark:text-green-200">
                Congratulations! 🎉
              </span>

              <p className="mt-1 text-sm leading-relaxed text-green-700 md:text-base dark:text-green-300">
                Your payment has been successfully approved. <br />
                Your profile is now live and fully active. <br />
                Start connecting and exploring meaningful matches today.
              </p>
            </div>
          </div>
        )}

        {/* ❌ FAILED MESSAGE */}
        {data?.status === "REJECTED" && (
          <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-5 shadow-sm dark:from-red-900/30 dark:to-red-800/20">
            <div className="flex items-center justify-center rounded-full bg-red-100 p-2 dark:bg-red-800">
              <XCircle className="text-red-600 dark:text-red-300" size={22} />
            </div>

            <div className="flex flex-col">
              <span className="text-lg font-semibold text-red-800 md:text-xl dark:text-red-200">
                Payment Rejected
              </span>

              <p className="mt-1 text-sm leading-relaxed text-red-700 md:text-base dark:text-red-300">
                We couldn&apos;t verify your payment at this time. <br />
                Please re-upload a clear and valid screenshot to continue.{" "}
                <br />
                Need help? Our support team is here for you.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-4">
          <span className="text-primary pl-2 text-xl font-bold">
            Payment Details
          </span>

          <div className="bg-card border-border flex flex-col gap-2 rounded-2xl border p-5 text-sm shadow-sm md:text-base lg:text-lg">
            {/* Plan Price */}
            <div className="flex items-center gap-3">
              <IndianRupee
                size={16}
                className="text-yellow-600 dark:text-yellow-400"
              />
              <span className="text-muted-foreground font-medium">
                Amount :
              </span>
              <span className="text-foreground font-semibold">
                {formatRupees(Number(data?.amount))}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <UserRound
                size={16}
                className="text-green-600 dark:text-green-400"
              />
              <span className="text-muted-foreground font-medium">
                Payee Name :
              </span>
              <span className="text-foreground font-semibold">
                {data?.paymentName}
              </span>
            </div>

            {/* Plan Duration */}
            <div className="flex items-center gap-3">
              <CalendarDays
                size={16}
                className="text-blue-600 dark:text-blue-400"
              />
              <span className="text-muted-foreground font-medium">
                Payment Date :
              </span>
              <span className="text-foreground font-semibold">
                {format(new Date(data?.createdAt as string), "dd/MM/yyyy")}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col space-y-4">
          <span className="text-primary pl-2 text-xl font-bold">
            Payment Status
          </span>

          <div className="bg-card border-border flex flex-col gap-2 rounded-2xl border p-5 text-sm shadow-sm md:text-base lg:text-lg">
            <div className="flex items-center gap-3">
              <BadgeCheck size={16} />
              <span className="text-muted-foreground font-medium">Status:</span>
              <Badge
                variant={
                  data?.status === "PENDING"
                    ? "outline"
                    : data?.status === "REJECTED"
                      ? "destructive"
                      : "default"
                }
                className={`text-foreground rounded-full font-semibold ${
                  data?.status === "APPROVED" && "bg-green-100 text-green-800"
                }`}
              >
                {data?.status === "PENDING" ? "VERIFYING" : data?.status}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays size={16} />
              <span className="text-muted-foreground font-medium">
                Created At:
              </span>
              <span className="text-foreground font-semibold">
                {formatDistanceToNow(new Date(data!.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {data?.screenShotUrl && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Camera size={16} />
                  <span className="text-muted-foreground font-medium">
                    Screenshot:
                  </span>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button
                      className="border-muted-foreground/20 hover:ring-ring focus:ring-ring flex items-center justify-center rounded-md border p-1 hover:ring-2 focus:ring-2 focus:outline-none"
                      aria-label="View full screenshot"
                    >
                      <div className="relative size-24">
                        <Image
                          src={data.screenShotUrl}
                          alt="User uploaded screenshot"
                          fill
                          className="rounded-md object-cover"
                        />
                      </div>
                    </button>
                  </DialogTrigger>

                  <DialogContent className="bg-background max-w-3xl p-0">
                    <DialogHeader className="flex items-center justify-between border-b p-3">
                      <DialogTitle className="text-lg font-semibold">
                        Screenshot Preview
                      </DialogTitle>
                    </DialogHeader>
                    <div className="bg-muted flex max-h-[80vh] items-center justify-center overflow-auto p-4">
                      <Image
                        src={data.screenShotUrl}
                        alt="Full size user screenshot"
                        width={1000}
                        height={1000}
                        className="h-auto max-h-[75vh] w-auto object-contain"
                        priority
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
