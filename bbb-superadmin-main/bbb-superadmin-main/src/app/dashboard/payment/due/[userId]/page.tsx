export const dynamic = "force-dynamic";

import { getAllPaymentByUserId } from "@/action/payment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EpmptyList } from "@/components/emptyList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Mail, Phone, UserRound } from "lucide-react";
import { format } from "date-fns";
import { formatRupees } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { IPayments } from "@/components/interface/IPayments";
import Link from "next/link";
import { PaymentStatus } from "@/components/enum/paymentStatus";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function PaymentListPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { userId } = await params;
  const payments = await getAllPaymentByUserId(userId);

  if (!payments)
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <EpmptyList
          title="No User Found"
          subtitle="No user found with the provided ID."
        />
      </div>
    );

  return (
    <div className="flex flex-1 flex-col space-y-3 p-6">
      <h1 className="text-lg md:text-xl lg:text-2xl">User Details</h1>
      {/* Profile Card */}
      <Link href={`/dashboard/profile/user/${payments.id}`}>
        <Card className="max-w-md rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={payments?.avatar ? payments?.avatar : "/groom.webp"}
                />
                <AvatarFallback>
                  {payments.firstName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xl font-semibold">
                {payments.title} {payments.firstName} {payments.middleName}{" "}
                {payments.lastName}
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="text-muted-foreground space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <UserRound size={16} />
              <span>{payments.gender}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>{payments.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} />
              <span>{payments.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays size={16} />
              <span>
                Plan Expiry:{" "}
                {format(payments.planExpiryDate || new Date(), "dd-MM-yyyy")}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Payments Table */}
      <PaymentsCardView payments={payments.payments!} />
    </div>
  );
}

function PaymentsCardView({ payments }: { payments: IPayments[] }) {
  // Sort by latest paymentDate
  const sortedPayments = [...payments].sort(
    (a, b) =>
      new Date(b.createdAt || new Date()).getTime() -
      new Date(a.createdAt || new Date()).getTime()
  );

  return (
    <div className="flex flex-1 flex-col space-y-4 pt-6">
      <h1 className="text-lg md:text-xl lg:text-2xl">Payments</h1>
      {sortedPayments.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <p className="text-muted-foreground">No payments found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedPayments.map((p) => (
            <Link href={`/dashboard/payment/view/${p.id}`} key={p.id}>
              <Card className="rounded-2xl shadow-md transition hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <CalendarDays size={16} />
                    <span>
                      {format(p.createdAt || new Date(), "dd MMM yyyy")}
                    </span>
                  </CardTitle>
                  <Badge
                    className={`${
                      p.status === PaymentStatus.PENDING
                        ? "bg-yellow-500 text-black"
                        : p.status === PaymentStatus.APPROVED
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                    } rounded-2xl`}
                  >
                    {p.status}
                  </Badge>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-2 text-sm">
                  {/* <div className="flex justify-between">
                    <span className="font-medium">UPI:</span>
                    <span>{p.upiId}</span>
                  </div> */}
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span className="font-semibold">
                      {formatRupees(Number(p.plan.price))}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-medium">Feedback:</span>
                    <span className="text-end font-semibold italic">
                      &quot; {p.feedback ? p.feedback : "N/A"} &quot;
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
