"use client";

import { getMatchingPaymentRequestByMessageId } from "@/actions/matching";
import ApiErrorPage from "@/components/apiErrorPage";
import DashboardHeader from "@/components/dashboard/header";
import { companyDetails, PAYMENT_UPI_ID } from "@/components/helper/constant";
import LoadingPage from "@/components/loader";
import ScreenshotUploadForPaidMatching from "@/components/ui-custom/screenshot-upload-matching";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  BookMarkedIcon,
  CalendarDays,
  Copy,
  IndianRupee,
  Info,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function MatchingPaymentClient({
  messageId,
}: {
  messageId: string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["getMatchingPaymentRequestByMessageId", messageId],
    queryFn: () => getMatchingPaymentRequestByMessageId(messageId),
  });

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load payment details"
      : "Something went wrong";
    return (
      <div className="flex flex-1 items-center justify-center">
        <ApiErrorPage
          title="Failed to load payment details"
          description={errorMessage}
        />
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(PAYMENT_UPI_ID);
    toast.success("UPI ID copied!");
  };

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader
        title={
          <div className="w-full flex items-center justify-center gap-2 bg-primary/20 p-4">
            <h1 className="font-semibold text-lg md:text-xl">
              Matching Payment
            </h1>
          </div>
        }
      />
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <LoadingPage />
        </div>
      ) : (
        data && (
          <div className="flex flex-col flex-1 p-4">
            <div className="flex flex-col space-y-4">
              <span className="text-xl font-bold text-primary pl-2">
                Payment Details
              </span>

              <div className="flex flex-col gap-2 p-5 bg-card border border-border rounded-2xl shadow-sm text-sm md:text-base lg:text-lg">
                {/* Plan Name */}
                {/* <div className="flex items-center gap-3">
                <BadgeCheck
                  size={16}
                  className="text-green-600 dark:text-green-400"
                />
                <span className="font-medium text-muted-foreground">
                  Plan Name:
                </span>
                <span className="font-semibold text-foreground">
                  {data.title}
                </span>
              </div> */}

                {/* Plan Price */}
                <div className="flex items-center gap-3">
                  <IndianRupee
                    size={16}
                    className="text-yellow-600 dark:text-yellow-400"
                  />
                  <span className="font-medium text-muted-foreground">
                    Amount :
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatINR(Number(data.price))}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <BookMarkedIcon
                    size={16}
                    className="text-green-600 dark:text-green-400"
                  />
                  <span className="font-medium text-muted-foreground">
                    Description :
                  </span>
                  <span className="font-semibold text-foreground">
                    {data.content}
                  </span>
                </div>

                {/* Plan Duration */}
                <div className="flex items-center gap-3">
                  <CalendarDays
                    size={16}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <span className="font-medium text-muted-foreground">
                    Duration :
                  </span>
                  <span className="font-semibold text-foreground">
                    12 Months
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4 mt-6 p-4 bg-card border border-border rounded-2xl shadow-sm">
              <h2 className="text-xl font-bold text-primary">Payment Method</h2>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-4">
                <Image
                  alt="QR Code"
                  width={200}
                  height={200}
                  className="rounded-xl border shadow-sm"
                  src="/payment/qr-code.svg"
                />

                {/* Payment App Icons */}
                <div className="flex gap-3">
                  {["bhim_upi", "phonepe", "gpay", "paytm"].map((app) => (
                    <Image
                      key={app}
                      alt={app}
                      width={32}
                      height={32}
                      className="w-9 h-9 rounded-full bg-card border p-1 shadow-sm hover:scale-105 transition-transform"
                      src={`/payment/${app}.svg`}
                    />
                  ))}
                </div>

                {/* Or */}
                <span className="text-muted-foreground font-medium">or</span>

                {/* UPI ID + Copy */}
                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg border w-fit">
                  <p className="text-sm sm:text-base font-medium">
                    <span className="text-muted-foreground">UPI ID:</span>{" "}
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {PAYMENT_UPI_ID}
                    </span>
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="hover:text-primary"
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4 mt-3">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl shadow-sm">
                <div className="mt-1 text-blue-600 dark:text-blue-400">
                  <Info className="w-5 h-5" />
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  After successful payment, please take a screenshot and send it
                  to our support team to proceed further.
                </p>
              </div>

              <div className="flex flex-col space-y-2">
                <p className="pl-2 font-semibold">Attach the screenshot</p>
                <ScreenshotUploadForPaidMatching messageId={messageId} />
              </div>

              <p
                className={`mt-4 text-center text-primary/80 text-lg md:text-xl`}
              >
                Welcome to the {companyDetails.name}
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
