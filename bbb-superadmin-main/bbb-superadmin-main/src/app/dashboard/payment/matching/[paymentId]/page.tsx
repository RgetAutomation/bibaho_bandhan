export const dynamic = "force-dynamic";

import { EpmptyList } from "@/components/emptyList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  Camera,
  IndianRupee,
  Info,
  MessageSquareQuote,
  Phone,
  UserRound,
} from "lucide-react";
import { formatRupees } from "@/lib/utils";
import PaymentClientComponent from "./paymentClient";
import { PaymentStatus } from "@/components/enum/paymentStatus";
import Link from "next/link";
import { format } from "date-fns";
import ScreenshotImageView from "./imageView";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { getMatchingPaymentDetailsByPaymentId } from "@/action/payment";

export default async function ViewPaymentDetails({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { paymentId } = await params;
  const payment = await getMatchingPaymentDetailsByPaymentId(paymentId);

  if (!payment) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <EpmptyList
          title="No Payment Found"
          subtitle="We could not find any payment with the provided ID."
        />
      </div>
    );
  }

  const fullName = `${payment.user.title} ${payment.user.firstName} ${payment.user.middleName ?? ""} ${payment.user.lastName}`;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <h1 className="text-lg font-semibold md:text-xl lg:text-2xl">
        View Payment
      </h1>

      <div className="flex flex-col gap-6 py-6 lg:flex-row">
        <Card className="w-full max-w-md rounded-2xl pt-0 shadow-lg transition hover:shadow-xl">
          {/* User Header */}
          <Link href={`/dashboard/profile/user/${payment.user.id}`}>
            <CardHeader className="hover:bg-primary/10 flex flex-row items-center gap-4 border-b pt-6 pb-4 transition-all duration-200 ease-in-out hover:rounded-t-2xl">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={
                    payment.user?.avatar
                      ? payment.user?.avatar
                      : payment.user?.gender === "MALE"
                        ? "/groom.webp"
                        : "/bride.webp"
                  }
                  alt={fullName}
                />
                <AvatarFallback>
                  {payment.user.firstName[0]}
                  {payment.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg font-semibold">
                  {fullName}
                </CardTitle>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Phone size={14} /> +91 {payment.user.phone}
                </div>
              </div>
            </CardHeader>
          </Link>

          {/* Payment Details */}
          <CardContent className="space-y-3">
            {/* <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">
                Payment For
              </span>
              <span>{payment.paymentType}</span>
            </div> */}

            <div className="flex flex-col space-y-2 rounded-2xl border p-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2 text-sm">
                  <IndianRupee size={14} />
                  Amount
                </span>
                <span className="font-semibold">
                  {formatRupees(Number(payment.amount))}
                </span>
              </div>

              {payment.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2 text-sm">
                    <CalendarDays size={14} />
                    Payment Date
                  </span>
                  <span>{format(payment.createdAt, "dd MMM yyyy")}</span>
                </div>
              )}

              {payment.paymentName && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2 text-sm">
                    <UserRound size={14} />
                    Payee Name
                  </span>
                  <span>{payment.paymentName}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Info size={14} />
                  Status
                </span>
                <Badge
                  className={`${
                    payment.status === PaymentStatus.PENDING
                      ? "bg-yellow-500 text-black"
                      : payment.status === PaymentStatus.APPROVED
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                  } rounded-2xl`}
                >
                  {payment.status}
                </Badge>
              </div>

              {payment.feedback && (
                <div className="flex flex-col gap-2">
                  <span className="text-muted-foreground flex items-center gap-2 text-sm">
                    <MessageSquareQuote size={14} />
                    Feedback
                  </span>
                  <div className="rounded-lg border bg-zinc-100 p-3 dark:bg-zinc-800">
                    <span className="text-end italic">
                      {" "}
                      &quot; {payment.feedback} &quot;
                    </span>
                  </div>
                </div>
              )}
            </div>

            {payment?.screenShotUrl && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Camera size={16} />
                  <span className="text-muted-foreground font-medium">
                    Screenshot:
                  </span>
                </div>
                {/* Thumbnail with dialog trigger */}
                <ScreenshotImageView imageUrl={payment.screenShotUrl} />
                {/* <Image
                  src={payment.screenShotUrl}
                  alt={payment.screenShotUrl}
                  width={900}
                  height={1600}
                  className="rounded-md object-cover"
                /> */}
              </div>
            )}
          </CardContent>
        </Card>

        <PaymentClientComponent
          paymentId={paymentId}
          //userId={payment.user.id}
        />
      </div>
    </div>
  );
}
