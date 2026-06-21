"use client";

import { getAllGhotokUserConnectionRequest } from "@/actions/ghotok";
import ApiErrorPage from "@/components/apiErrorPage";
import ButtonLoading from "@/components/buttonLoading";
import ContentNotFound from "@/components/contentNotFound";
import {
  IConnectionRequestReceiverUser,
  IConnectionRequestSenderUser,
} from "@/components/interface/ghotok/IConnectionRequest";
import LoadingPage from "@/components/loader";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ConnectionRequestClient() {
  const [activeTab, setActiveTab] = useState<"groom" | "bride">("groom");
  const [requestType, setRequestType] = useState<"received" | "sent">("received");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["getAllGhotokUsersConnectionReq"],
    queryFn: () => getAllGhotokUserConnectionRequest(),
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to get connection requests"
      : "Something went wrong. Please try again.";

    return (
      <div className={"flex w-full flex-1 flex-col"}>
        <ApiErrorPage title="Failed to load users" description={errorMessage} />
      </div>
    );
  }

  const filteredData = data?.filter((connection) => {
    if (requestType === "received") {
      if (!connection.receiver.isGhotokOwned) return false;
      if (activeTab === "groom") return connection.receiver.gender === "MALE";
      return connection.receiver.gender === "FEMALE";
    } else {
      if (!connection.sender.isGhotokOwned) return false;
      if (activeTab === "groom") return connection.sender.gender === "MALE";
      return connection.sender.gender === "FEMALE";
    }
  });

  const groomReqCount = data?.filter((connection) => {
    if (requestType === "received") {
      return connection.receiver.isGhotokOwned && connection.receiver.gender === "MALE";
    } else {
      return connection.sender.isGhotokOwned && connection.sender.gender === "MALE";
    }
  })?.length || 0;

  const brideReqCount = data?.filter((connection) => {
    if (requestType === "received") {
      return connection.receiver.isGhotokOwned && connection.receiver.gender === "FEMALE";
    } else {
      return connection.sender.isGhotokOwned && connection.sender.gender === "FEMALE";
    }
  })?.length || 0;

  return (
    <div className="relative flex w-full flex-1 flex-col">
      <div className="bg-card flex w-full flex-col justify-between items-center gap-4 border-b p-6 md:flex-row md:p-8">
        {/* Title */}
        <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100 text-left">
          Connection Requests ({filteredData?.length || 0})
        </h1>

        {/* Pill Tabs matching the design */}
        <div className="flex bg-muted p-1 rounded-full w-full max-w-md shadow-inner">
          <button
            onClick={() => setActiveTab("groom")}
            className={`relative flex-1 flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
              activeTab === "groom" 
                ? "bg-primary shadow-md text-white scale-[1.02]" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Interest Groom
            {groomReqCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm border-2 border-background">
                {groomReqCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("bride")}
            className={`relative flex-1 flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
              activeTab === "bride" 
                ? "bg-primary shadow-md text-white scale-[1.02]" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Interest Bride
            {brideReqCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm border-2 border-background">
                {brideReqCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col items-center justify-start p-5">

        {/* Sent / Received Tabs */}
        <div className="flex bg-muted/50 p-1 rounded-full w-full max-w-[240px] shadow-sm mb-6 border">
          <button
            onClick={() => setRequestType("received")}
            className={`flex-1 px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
              requestType === "received" 
                ? "bg-background shadow-md text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Received
          </button>
          <button
            onClick={() => setRequestType("sent")}
            className={`flex-1 px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
              requestType === "sent" 
                ? "bg-background shadow-md text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sent
          </button>
        </div>

        {filteredData?.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center w-full">
            <ContentNotFound
              title="No Connection Requests found"
              description={`We couldn't find any connection requests for ${activeTab === "groom" ? "grooms" : "brides"}.`}
            />
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredData?.map((connection) => (
              <UserCard
                key={connection.id}
                id={connection.id}
                createdAt={connection.createdAt}
                senderUser={connection.sender}
                receiverUser={connection.receiver}
                refetch={refetch}
                type={requestType}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserCard({
  id,
  createdAt,
  senderUser,
  receiverUser,
  refetch,
  type,
}: {
  id: string;
  createdAt: Date;
  senderUser: IConnectionRequestSenderUser;
  receiverUser: IConnectionRequestReceiverUser;
  refetch: () => void;
  type: "sent" | "received";
}) {
  const [loadingButton, setLoadingButton] = useState<
    "accept" | "reject" | null
  >(null);

  const handleRequestUpdate = async (requestId: string, status: boolean) => {
    setLoadingButton(status ? "accept" : "reject");
    try {
      const response = await api.get<AxiosResponse<null>>(
        status === true
          ? `/app/ghotok/users/request/connections/${requestId}/accept`
          : `/app/ghotok/users/request/connections/${requestId}/reject`
      );
      if (response.data.success) {
        toast.success(response.data.message);
        refetch();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);

      const errorMessage = isAxiosError(error)
        ? error.response?.data.message
        : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoadingButton(null);
    }
  };

  return (
    <div className="bg-card rounded-xl border bg-gradient-to-br p-3 shadow-lg dark:border-slate-700">
      {/* Send From */}
      <div className="flex flex-col gap-1">
        <h2 className="text-muted-foreground text-xs font-medium">
          Send from
        </h2>
        <Link href={`/dashboard/ghotok/profile/public/${senderUser.id}`}>
          <div className="bg-card/50 flex items-center gap-2 rounded-lg border p-2 shadow-sm transition hover:shadow-md dark:bg-slate-900/50">
            <Avatar className="ring-primary/20 size-9 ring-2">
              <AvatarImage
                src={
                  senderUser.avatar
                    ? senderUser.avatar
                    : senderUser.gender === "MALE"
                      ? "/groom.webp"
                      : "/bride.webp"
                }
                alt={senderUser.id}
              />
              <AvatarFallback className="text-sm font-semibold">
                {senderUser.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm leading-tight font-semibold">
                {senderUser.title} {senderUser.lastName}
              </h3>
              <p className="text-muted-foreground text-[10px]">Sender</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="via-border my-2 h-px w-full bg-gradient-to-r from-transparent to-transparent"></div>

      {/* Send To */}
      <div className="flex flex-col gap-1">
        <h2 className="text-muted-foreground text-xs font-medium">Send to</h2>
        <Link href={`/dashboard/ghotok/users/${receiverUser.id}/view`}>
          <div className="bg-card/50 flex items-center gap-2 rounded-lg border p-2 shadow-sm transition hover:shadow-md dark:bg-slate-900/50">
            <Avatar className="ring-primary/20 size-9 ring-2">
              <AvatarImage
                src={
                  receiverUser.avatar
                    ? receiverUser.avatar
                    : receiverUser.gender === "MALE"
                      ? "/groom.webp"
                      : "/bride.webp"
                }
                alt={receiverUser.id}
              />
              <AvatarFallback className="text-sm font-semibold">
                {receiverUser.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm leading-tight font-semibold">
                {receiverUser.title} {receiverUser.firstName}{" "}
                {receiverUser.middleName} {receiverUser.lastName}
              </h3>
              <p className="text-muted-foreground text-[10px]">Recipient</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Actions */}
      <div className="mt-3 w-full">
        {type === "received" ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="destructive"
              className="w-full rounded-full h-8 py-1 text-xs font-medium transition hover:scale-[1.02]"
              onClick={() => handleRequestUpdate(id, false)}
              disabled={loadingButton === "reject"}
            >
              {loadingButton === "reject" ? (
                <ButtonLoading text="Rejecting" />
              ) : (
                "Reject"
              )}
            </Button>
            <Button
              className="w-full rounded-full h-8 bg-green-600 py-1 text-xs font-medium transition hover:scale-[1.02] hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
              onClick={() => handleRequestUpdate(id, true)}
              disabled={loadingButton === "accept"}
            >
              {loadingButton === "accept" ? (
                <ButtonLoading text="Accepting" />
              ) : (
                "Accept"
              )}
            </Button>
          </div>
        ) : (
          <div className="w-full">
            <Button
              variant="outline"
              className="w-full rounded-full h-8 py-1 text-xs font-medium cursor-default"
              disabled
            >
              Request Pending
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
