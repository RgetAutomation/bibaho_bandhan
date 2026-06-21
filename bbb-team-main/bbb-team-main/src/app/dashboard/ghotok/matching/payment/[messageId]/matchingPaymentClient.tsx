"use client";

import { getMatchingPaymentRequestByMessageId } from "@/actions/ghotok";
import ApiErrorPage from "@/components/apiErrorPage";
import { companyDetails, PAYMENT_UPI_ID } from "@/components/helper/constant";
import ScreenshotUploadForPaidMatching from "@/components/helper/ghotok/screenshot-upload-matching";
import LoadingPage from "@/components/loader";
import { Button } from "@/components/ui/button";
import { formatRupees } from "@/lib/utils";
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
    <div className="flex flex-1 flex-col">
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <LoadingPage />
        </div>
      ) : (
        data && (
          <div className="flex flex-1 flex-col p-4">
            <div className="flex flex-col space-y-4">
              <span className="text-primary pl-2 text-xl font-bold">
                Payment Details
              </span>

              <div className="bg-card border-border flex flex-col gap-2 rounded-2xl border p-5 text-sm shadow-sm md:text-base lg:text-lg">
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
                  <span className="text-muted-foreground font-medium">
                    Amount :
                  </span>
                  <span className="text-foreground font-semibold">
                    {formatRupees(Number(data.price))}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <BookMarkedIcon
                    size={16}
                    className="text-green-600 dark:text-green-400"
                  />
                  <span className="text-muted-foreground font-medium">
                    Description :
                  </span>
                  <span className="text-foreground font-semibold">
                    {data.content}
                  </span>
                </div>

                {/* Plan Duration */}
                <div className="flex items-center gap-3">
                  <CalendarDays
                    size={16}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <span className="text-muted-foreground font-medium">
                    Duration :
                  </span>
                  <span className="text-foreground font-semibold">
                    12 Months
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card border-border mt-6 flex flex-col space-y-4 rounded-2xl border p-4 shadow-sm">
              <h2 className="text-primary text-xl font-bold">Payment Method</h2>

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
                      className="bg-card h-9 w-9 rounded-full border p-1 shadow-sm transition-transform hover:scale-105"
                      src={`/payment/${app}.svg`}
                    />
                  ))}
                </div>

                {/* Or */}
                <span className="text-muted-foreground font-medium">or</span>

                {/* UPI ID + Copy */}
                <div className="bg-muted flex w-fit items-center gap-2 rounded-lg border px-4 py-2">
                  <p className="text-sm font-medium sm:text-base">
                    <span className="text-muted-foreground">UPI ID:</span>{" "}
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {PAYMENT_UPI_ID}
                    </span>
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="hover:text-primary"
                  >
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-col space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm dark:border-blue-800 dark:bg-blue-950">
                <div className="mt-1 text-blue-600 dark:text-blue-400">
                  <Info className="h-5 w-5" />
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  After successful payment, please take a screenshot and send it
                  to our support team to proceed further.
                </p>
              </div>

              <div className="flex flex-col space-y-2">
                <p className="pl-2 font-semibold">Attach the screenshot</p>
                <ScreenshotUploadForPaidMatching
                  messageId={messageId}
                  userId={data.userId}
                />
              </div>

              <p
                className={`text-primary/80 mt-4 text-center text-lg md:text-xl`}
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
