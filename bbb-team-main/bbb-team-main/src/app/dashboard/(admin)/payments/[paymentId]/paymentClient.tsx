"use client";

import { getPaymentDetailsById } from "@/actions/payments";
import ApiErrorPage from "@/components/apiErrorPage";
import LoadingPage from "@/components/loader";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PaymentDetailsClientPage({
  userId,
  paymentId,
}: {
  userId: string;
  paymentId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["paymentDetails", paymentId],
    queryFn: () => getPaymentDetailsById(paymentId),
    enabled: !!paymentId,
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load payment details"
      : "Something went wrong. Please try again later.";
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <ApiErrorPage
          title={"Failed to load payment details"}
          description={errorMessage}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col md:min-h-min">
      <div className={"flex items-center gap-4 border-b p-5"}>
        <Button
          onClick={() => router.back()}
          variant={"outline"}
          className={"size-10 rounded-full"}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold md:text-xl lg:text-2xl">
          Subscription Payments Details
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Plan Details */}
          <Card className="bg-card border-border h-fit flex-1 rounded-xl border shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold md:text-xl lg:text-2xl">
                Plan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="flex justify-between text-sm md:text-base lg:text-lg">
                <span className="font-light">Name:</span> {data?.plan?.title}
              </p>
              <p className="flex justify-between text-sm md:text-base lg:text-lg">
                <span className="font-light">Amount:</span>{" "}
                <span className="font-semibold text-green-600">
                  ₹{data?.plan?.price}
                </span>
              </p>
              <p className="flex justify-between text-sm md:text-base lg:text-lg">
                <span className="font-light">Duration:</span>{" "}
                {data?.plan?.duration} days
              </p>
              {/* <p className="flex justify-between text-sm md:text-base lg:text-lg">
                <span className="font-light">Connections:</span>{" "}
                {data?.plan?.connection}
              </p> */}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="bg-card border-border h-fit flex-1 rounded-xl border shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold md:text-xl lg:text-2xl">
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.createdAt && (
                <p className="text-sm md:text-base lg:text-lg">
                  <span className="font-light">Payment Date:</span>{" "}
                  <span className="text-semibold font-medium">
                    {format(new Date(data?.createdAt), "dd MMM yyyy")}
                  </span>
                </p>
              )}
              {/* {data?.paymentName && (
                <p className="text-sm md:text-base lg:text-lg">
                  <span className="font-light">Payment Name:</span>{" "}
                  <span className="text-semibold font-medium">
                    {data?.paymentName}
                  </span>
                </p>
              )} */}
              {/* {data?.amount && (
                <p className="text-sm md:text-base lg:text-lg">
                  <span className="font-light">Payment Amount:</span>{" "}
                  <span className="font-semibold text-green-600">
                    ₹{data?.amount}
                  </span>
                </p>
              )} */}

              <p className="flex items-center gap-2 text-sm md:text-base lg:text-lg">
                <span className="font-light">Status:</span>{" "}
                <Badge
                  variant={
                    data?.status === "PENDING"
                      ? "outline"
                      : data?.status === "REJECTED"
                        ? "destructive"
                        : "default"
                  }
                  className={`rounded-2xl uppercase ${
                    data?.status === "APPROVED" && "text-green-600"
                  }`}
                >
                  {data?.status}
                </Badge>
              </p>
              {data?.feedback && (
                <p className="text-sm md:text-base lg:text-lg">
                  <span className="font-medium">Remark:</span> {data?.feedback}
                </p>
              )}

              {/* {data?.screenShotUrl && (
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
                        className="border-muted-foreground/20 hover:ring-ring focus:ring-ring flex cursor-pointer items-center justify-center rounded-md border p-1 hover:ring-2 focus:ring-2 focus:outline-none"
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
              )} */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
