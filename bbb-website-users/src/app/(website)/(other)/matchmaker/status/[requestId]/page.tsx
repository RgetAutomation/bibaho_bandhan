"use server";

import { getGhotokRequestById } from "@/actions/getGhotokRequest";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Info,
  Mail,
  Mars,
  Phone,
  UserRound,
  Venus,
} from "lucide-react";
import { IJoinGhotokRequest } from "@/components/interface/IJoinGhotok";
import { EmptyViewCard } from "@/components/emptyView";
import CopyButton from "@/components/landing/copyButton";

export default async function RequestedSuccessPage({
  params,
}: Readonly<{
  params: Promise<{ requestId: string }>;
}>) {
  const { requestId } = await params;
  const data = await getGhotokRequestById(requestId);

  if (!data.data) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-5 md:p-8">
        <EmptyViewCard
          title="Request not found"
          description="The requested ghotok request was not found."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-5 md:p-8">
      <GhotokRequestCard data={data.data} />
    </div>
  );
}

function GhotokRequestCard({ data }: { data: IJoinGhotokRequest }) {
  const fullName = [data.firstName, data.middleName, data.lastName]
    .filter(Boolean)
    .join(" ");

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500",
    APPROVED: "bg-green-600",
    REJECTED: "bg-red-600",
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card className="rounded-2xl shadow-lg border bg-card p-6 text-center">
        <CardHeader className="flex flex-col items-center">
          <div className="w-fit flex justify-center mb-1 bg-green-600 rounded-full">
            <CheckCircle2 className="w-16 h-16 text-card" />
          </div>
          <CardTitle className="text-2xl font-bold">Hey {fullName},</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Success Message */}
          <p className="text-muted-foreground leading-relaxed">
            Your request as a{" "}
            <span className="font-semibold dark:text-white">matchmaker</span>{" "}
            has been successfully sent. We will get in touch with you soon.
            After your profile is approved, you can log in to your dashboard.
          </p>

          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-2">
              <span className="font-medium text-muted-foreground">
                Request ID:
              </span>
              <span>{data.id}</span>
            </div>
            <CopyButton text={data.id} />
          </div>

          <div className="mt-6 text-left space-y-3">
            <h3 className="text-lg font-semibold">Your Details</h3>

            <div className="flex items-center gap-3">
              <UserRound className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Gender:</span>
              <div className="flex items-center gap-1 border shadow rounded-2xl px-2">
                {data.gender === "MALE" ? (
                  <Mars className="w-4 h-4" />
                ) : (
                  <Venus className="w-4 h-4" />
                )}
                <span>{data.gender}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Email:</span>
              <span>{data.email}</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Phone:</span>
              <span>+91 {data.phone}</span>
            </div>

            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Status:</span>
              <Badge
                className={`${
                  statusColors[data.status] || "bg-gray-500"
                } text-white px-3 py-1 rounded-full`}
              >
                {data.status}
              </Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-start text-sm text-muted-foreground leading-relaxed">
            <span className="font-bold">Note :</span> Please{" "}
            <span className="font-medium">bookmark this page</span> or keep this
            tab open to easily check the{" "}
            <span className="font-medium">status of your request</span>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
