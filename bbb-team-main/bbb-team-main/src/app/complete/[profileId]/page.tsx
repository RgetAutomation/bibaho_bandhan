"use client";

import { getCompleteProfileRequestStatus } from "@/actions/completeProfile";
import LoadingPage from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { format } from "date-fns";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect, useParams, useRouter } from "next/navigation";

export default function ProfileStatus() {
  const { profileId } = useParams<{ profileId: string }>();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["getProfileCompleteStatus"],
    queryFn: () => getCompleteProfileRequestStatus(profileId),
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load chats"
      : "Something went wrong";

    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center overflow-y-auto">
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (!data) {
    redirect("/");
    // return (
    //   <div className="flex min-h-screen flex-1 flex-col items-center justify-center overflow-y-auto">
    //     <div className="bg-card flex min-w-xs flex-col items-center rounded-2xl border p-5 shadow-md sm:min-w-sm md:min-w-md lg:min-w-lg">
    //       <div className="bg-card/10 flex h-16 w-16 items-center justify-center rounded-full dark:bg-zinc-800">
    //         <AlertCircle className="text-primary h-12 w-12" />
    //       </div>
    //       <h1 className="p-2 text-2xl font-semibold">No Data Found</h1>
    //       <p className="text-muted-foreground text-sm">
    //         We could not find any data for this profile
    //       </p>
    //     </div>
    //   </div>
    // );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border shadow-md">
        {/* Header */}
        <div className="flex w-full items-center gap-4 border-b p-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="size-10 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">Profile Status</h1>
        </div>

        {/* Status Section */}
        <div className="space-y-2 border-b p-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <Badge
              className={`rounded-full px-2 py-1 text-xs ${
                data?.status === "APPROVED"
                  ? "bg-green-600 text-white"
                  : data?.status === "REJECTED"
                    ? "bg-red-600 text-white"
                    : "bg-orange-200 text-zinc-800"
              }`}
            >
              {data?.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Submitted At: {format(data?.createdAt || "", "dd MMM yyyy")}
          </p>
        </div>

        {/* Address Section */}
        <div className="space-y-2 p-4">
          <h2 className="border-b pb-2 text-lg font-semibold">
            Submitted Details
          </h2>
          <div className="space-y-1 pt-2 text-sm">
            <div className="flex w-full flex-col items-center justify-center border-b p-4">
              <Avatar className="size-20">
                <AvatarImage src={data?.avatar || "/groom.webp"} />
                <AvatarFallback className="text-lg font-semibold">
                  {data?.team.firstName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="mt-2 text-lg font-bold">
                {data?.team.firstName} {data?.team.middleName}{" "}
                {data?.team.lastName}
              </h1>
            </div>
            <p className="flex justify-between pt-4">
              <span className="font-medium">Date of Birth:</span>{" "}
              {format(data?.dob ?? "", "dd MMM yyyy")}
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Address Line 1:</span>{" "}
              {data?.addressLine1}
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Address Line 2:</span>{" "}
              {data?.addressLine2 || "-"}
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Police Station:</span>{" "}
              {data?.policeStation}
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Post Office:</span>{" "}
              {data?.postOffice}
            </p>
            <p className="flex justify-between">
              <span className="font-medium">District:</span> {data?.dist}
            </p>
            <p className="flex justify-between">
              <span className="font-medium">State:</span> {data?.state}
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Pin Code:</span> {data?.pinCode}
            </p>
            <p className="flex justify-between">
              <span className="font-medium">ID Proof:</span>{" "}
              <Link
                href={data?.identificationProof || ""}
                target="_blank"
                className="text-primary underline"
              >
                View ID Proof
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
