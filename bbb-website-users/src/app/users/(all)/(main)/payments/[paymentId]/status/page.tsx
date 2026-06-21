"use client";

import { getPaymentStatusById } from "@/actions/payments";
import ApiErrorPage from "@/components/apiErrorPage";
import LoadingPage from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { formatDistanceToNow } from "date-fns";
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
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PaymentStatusPage() {
  const router = useRouter();
  const { paymentId } = useParams<{ paymentId: string }>();
  const searchParams = useSearchParams();
  const pageStatus = searchParams.get("pay");
  const [open, setOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["getPaymentStatusById", paymentId],
    queryFn: () => getPaymentStatusById(paymentId!),
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load payment status details"
      : "Something went wrong";
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen overflow-y-auto">
        <ApiErrorPage
          title={"Failed to payment status"}
          description={errorMessage}
        />
      </div>
    );
  }

  function handleBack() {
    if (pageStatus && pageStatus === "1") return router.push("/users/account");
    router.back();
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full flex flex-col border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-center gap-2 relative">
          <Button
            variant={"default"}
            size={"icon"}
            className="absolute left-4 rounded-full"
            onClick={handleBack}
          >
            <ChevronLeftIcon className="size-5 mr-0.5" />
          </Button>

          <div className="w-full flex items-center justify-center gap-2 bg-primary/20 p-4">
            <h1 className="font-semibold text-lg md:text-xl">Payment Status</h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 space-y-4">
        {/* ✅ SUCCESS MESSAGE */}
        {data?.status === "PENDING" && (
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 shadow-sm">
            <div className="flex items-center justify-center rounded-full bg-green-100 dark:bg-green-800 p-2">
              <BadgeCheck
                className="text-green-600 dark:text-green-300"
                size={22}
              />
            </div>

            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-semibold text-green-800 dark:text-green-200">
                Thank you! 🎉
              </span>

              <p className="text-sm md:text-base text-green-700 dark:text-green-300 mt-1 leading-relaxed">
                Your screenshot has been successfully submitted. <br />
                Verification is in progress (1–24 hours). <br />
                Your account will be activated once approved.
              </p>
            </div>
          </div>
        )}

        {/* ✅ APPROVED MESSAGE */}
        {data?.status === "APPROVED" && (
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 shadow-sm">
            <div className="flex items-center justify-center rounded-full bg-green-100 dark:bg-green-800 p-2">
              <BadgeCheck
                className="text-green-600 dark:text-green-300"
                size={22}
              />
            </div>

            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-semibold text-green-800 dark:text-green-200">
                Congratulations! 🎉
              </span>

              <p className="text-sm md:text-base text-green-700 dark:text-green-300 mt-1 leading-relaxed">
                Your payment has been successfully approved. <br />
                Your profile is now live and fully active. <br />
                Start connecting and exploring meaningful matches today.
              </p>
            </div>
          </div>
        )}

        {/* ❌ FAILED MESSAGE */}
        {data?.status === "REJECTED" && (
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 shadow-sm">
            <div className="flex items-center justify-center rounded-full bg-red-100 dark:bg-red-800 p-2">
              <XCircle className="text-red-600 dark:text-red-300" size={22} />
            </div>

            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-semibold text-red-800 dark:text-red-200">
                Payment Rejected
              </span>

              <p className="text-sm md:text-base text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                We couldn&apos;t verify your payment at this time. <br />
                Please re-upload a clear and valid screenshot to continue.{" "}
                <br />
                Need help? Our support team is here for you.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-4">
          <span className="text-xl font-bold text-primary pl-2">
            Plan Details
          </span>

          <div className="flex flex-col gap-2 p-5 bg-card border border-border rounded-2xl shadow-sm text-sm md:text-base lg:text-lg">
            <div className="flex items-center gap-3">
              <BadgeCheck
                size={16}
                className="text-green-600 dark:text-green-400"
              />
              <span className="font-medium text-muted-foreground">
                Plan Name:
              </span>
              <span className="font-semibold text-foreground">
                {data?.plan.title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <IndianRupee
                size={16}
                className="text-yellow-600 dark:text-yellow-400"
              />
              <span className="font-medium text-muted-foreground">
                Plan Price:
              </span>
              <span className="font-semibold text-foreground">
                {formatINR(Number(data?.plan.price))}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays
                size={16}
                className="text-blue-600 dark:text-blue-400"
              />
              <span className="font-medium text-muted-foreground">
                Plan Duration:
              </span>
              <span className="font-semibold text-foreground">
                {data?.plan.duration} days
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4 mt-4">
          <span className="text-xl font-bold text-primary pl-2">
            Payment Status
          </span>

          <div className="flex flex-col gap-2 p-5 bg-card border border-border rounded-2xl shadow-sm text-sm md:text-base lg:text-lg">
            <div className="flex items-center gap-3">
              <UserRound size={16} />
              <span className="font-medium text-muted-foreground">
                Payment Name:
              </span>
              <span className="font-semibold text-foreground">
                {data?.paymentName}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <BadgeCheck size={16} />
              <span className="font-medium text-muted-foreground">Status:</span>
              <Badge
                variant={
                  data?.status === "PENDING"
                    ? "outline"
                    : data?.status === "REJECTED"
                      ? "destructive"
                      : "default"
                }
                className={`font-semibold text-foreground rounded-full ${
                  data?.status === "APPROVED" && "bg-green-100 text-green-800"
                }`}
              >
                {data?.status}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays size={16} />
              <span className="font-medium text-muted-foreground">
                Created At:
              </span>
              <span className="font-semibold text-foreground">
                {formatDistanceToNow(new Date(data!.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {data?.screenShotUrl && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Camera size={16} />
                  <span className="font-medium text-muted-foreground">
                    Screenshot:
                  </span>
                </div>
                {/* Thumbnail with dialog trigger */}
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button
                      className="flex items-center justify-center rounded-md border border-muted-foreground/20 p-1 hover:ring-2 hover:ring-ring focus:outline-none focus:ring-2 focus:ring-ring"
                      aria-label="View full screenshot"
                    >
                      <div className="relative size-24">
                        <Image
                          src={data.screenShotUrl}
                          alt="User uploaded screenshot"
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    </button>
                  </DialogTrigger>

                  {/* Dialog */}
                  <DialogContent className="max-w-3xl p-0 bg-background">
                    <DialogHeader className="flex justify-between items-center p-3 border-b">
                      <DialogTitle className="text-lg font-semibold">
                        Screenshot Preview
                      </DialogTitle>
                    </DialogHeader>

                    {/* Full image with zoom */}
                    <div className="flex justify-center items-center bg-muted p-4 max-h-[80vh] overflow-auto">
                      <Image
                        src={data.screenShotUrl}
                        alt="Full size user screenshot"
                        width={1000}
                        height={1000}
                        className="object-contain max-h-[75vh] w-auto h-auto"
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
