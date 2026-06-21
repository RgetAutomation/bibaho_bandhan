"use client";

import { ITeamUserMessage } from "@/components/interface/ITeamUserChat";
import LoadingPage from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useTeamUserMessages } from "@/components/useTeamUserMessages";
import api from "@/lib/axiosInstance";
import { formatRupees, addIdPrefix } from "@/lib/utils";
import { AxiosResponse } from "@/types/AxiosResponse";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import {
  ArrowLeft,
  Clock,
  CreditCard,
  Crown,
  EllipsisVertical,
  Flag,
  IndianRupee,
  Send,
  ShieldEllipsis,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";

export interface IPlans {
  id: string;
  title: string;
  price: number;
  duration: number;
}

export default function ChatClientPage({
  currentUserId,
  conversationId,
}: {
  currentUserId: string;
  conversationId: string;
}) {
  const {
    data: allPlans,
    isLoading: isLoadingPlans,
    isError,
  } = useQuery({
    queryKey: ["getAllPlans"],
    queryFn: async () => {
      const response = await api.get<AxiosResponse<IPlans[]>>("/users/plans");
      return response.data.data;
    },
  });
  const {
    participants,
    messages,
    isLoading,
    sendMessage,
    sendPaymentMessage,
    startConversation,
  } = useTeamUserMessages(conversationId, currentUserId);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messageType, setMessageType] = useState<"TEXT" | "PAYMENT">("TEXT");
  const [inputMessage, setInputMessage] = useState("");
  const [inputPlan, setInputPlan] = useState<IPlans | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    startConversation();
  }, [startConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderDateSeparator = (date: Date) => {
    let dateString = "";

    if (isToday(date)) {
      dateString = "Today";
    } else if (isYesterday(date)) {
      dateString = "Yesterday";
    } else {
      dateString = format(new Date(date), "dd MMM yyyy");
    }

    return (
      <div className="flex w-full items-center justify-center gap-2 py-2">
        <span className="rounded-full border bg-zinc-200 px-2 py-1 text-sm shadow-md dark:bg-zinc-800">
          {dateString}
        </span>
      </div>
    );
  };

  const groupedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return {};
    return messages.reduce<Record<string, typeof messages>>((acc, msg) => {
      const d = new Date(msg.createdAt).toISOString().split("T")[0]; // "YYYY-MM-DD"
      if (!acc[d]) acc[d] = [];
      acc[d].push(msg);
      return acc;
    }, {});
  }, [messages]);

  if (isLoading) {
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center">
      <LoadingPage />
    </div>;
  }

  const handleSendMessage = () => {
    if (messageType === "PAYMENT") {
      sendPaymentMessage(
        inputPlan?.id || "",
        inputMessage,
        inputPlan?.title || "",
        inputPlan?.price || 0,
        inputPlan?.duration || 0
      );
      setInputPlan(null);
      setInputMessage("");
      setMessageType("TEXT");
    }

    if (messageType === "TEXT") {
      sendMessage(inputMessage.trim() || "");
      setInputMessage(""); // clear selected message
    }
  };

  return (
    <div className="flex h-[91vh] flex-col">
      {/* Header */}
      <div className="bg-card flex w-full items-center justify-between border-x shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant={"ghost"}
            size={"icon"}
            className="h-8 w-8 rounded-2xl"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                participants?.avatar
                  ? participants?.avatar
                  : participants?.gender === "MALE"
                    ? "/groom.webp"
                    : "/bride.webp"
              }
              alt={participants?.title}
            />
            <AvatarFallback>
              {participants?.gender.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-base font-semibold">
              {participants?.title} {participants?.lastName}
            </div>
            {/* <div className="text-xs text-gray-500">
            {conversation?.type?.replace("_", " ")}
          </div> */}
          </div>
        </div>
        <div className="flex items-center gap-2 pr-4">
          <Button
            className="rounded-full"
            onClick={() => {
              setDrawerOpen(true);
              setMessageType("PAYMENT");
            }}
          >
            <Crown className="h-4 w-4" />
            <span>Plans</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent sideOffset={16} align="end">
              <DropdownMenuItem className="p-2" asChild>
                <Link href={`/dashboard/report/user/${participants?.id}`}>
                  <Flag /> Report
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className={"flex-1 overflow-y-auto"}>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {renderDateSeparator(new Date(date))}
              {msgs.map((message: ITeamUserMessage) =>
                message.type === "PAYMENT" ? (
                  <PlanBubble
                    key={message.id}
                    currentUserId={currentUserId}
                    message={message}
                    participantName={participants?.lastName}
                  />
                ) : (
                  <MessageBubble
                    key={message.id}
                    currentUserId={currentUserId}
                    message={message}
                    participantName={participants?.lastName}
                  />
                )
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-card flex items-start gap-2 border-t p-4">
        <div className="flex w-full flex-col gap-2">
          {messageType === "PAYMENT" && inputPlan && (
            <div className="border-input bg-card hover:bg-accent hover:text-accent-foreground flex flex-col gap-1 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg">{inputPlan?.title}</h1>
                  <Badge
                    variant="outline"
                    className="rounded-2xl border-green-500 text-[1rem] font-bold text-green-500"
                  >
                    {formatRupees(Number(inputPlan?.price))}
                  </Badge>
                </div>
                <Button
                  variant={"ghost"}
                  className="rounded-full"
                  onClick={() => setMessageType("TEXT")}
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                Duration : {inputPlan?.duration} days
              </p>
            </div>
          )}
          <Input
            className="rounded-full px-4"
            placeholder="Select a message to send"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
        </div>
        <Button
          className="rounded-4xl"
          onClick={handleSendMessage}
          disabled={!inputMessage}
        >
          Send <Send className="" />
        </Button>
      </div>

      {/* Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="flex items-center justify-center p-4">
          <DrawerHeader>
            <DrawerTitle>Select a Message</DrawerTitle>
            <DrawerDescription>Select a message to send</DrawerDescription>
          </DrawerHeader>

          <div className="flex w-full justify-center">
            <div className="flex max-h-[70vh] w-full flex-col gap-2 overflow-y-auto pb-6 sm:max-w-sm md:max-w-md lg:max-w-lg">
              {allPlans?.map((msg: IPlans, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setInputPlan(msg);
                    setDrawerOpen(false);
                  }}
                  className="border-input bg-card hover:bg-accent hover:text-accent-foreground flex cursor-pointer flex-col gap-1 rounded-md border p-3"
                >
                  <div className="flex items-center justify-between">
                    <h1 className="text-lg">{msg.title}</h1>
                    <Badge
                      variant="outline"
                      className="rounded-2xl border-green-500 text-[1rem] font-bold text-green-500"
                    >
                      {formatRupees(Number(msg.price))}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {msg.duration} days
                  </p>
                </div>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export function MessageBubble({
  currentUserId,
  message,
  participantName,
}: {
  currentUserId: string;
  message: ITeamUserMessage;
  participantName?: string;
}) {
  const isSentByTeam = !!message.senderTeamId;
  const isOwn = message.senderTeamId === currentUserId;
  
  return (
    <div className={`mb-3 flex flex-col ${isSentByTeam ? "items-end" : "items-start"}`}>
      {isSentByTeam ? (
        <span className="text-xs text-muted-foreground mb-1 mr-1">
          {isOwn ? "You" : message.senderTeam ? addIdPrefix(message.senderTeam.internalId.toString(), message.senderTeam.role as any) : "Another Admin"}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground mb-1 ml-1">{participantName || "User"}</span>
      )}
      <div className="relative flex max-w-[70%] flex-col">
        <div
          className={`rounded-2xl px-4 py-2 break-words shadow-sm ${
            isOwn
              ? "rounded-br-none bg-rose-500 text-white"
              : isSentByTeam
              ? "rounded-br-none bg-indigo-500 text-white"
              : "rounded-bl-none bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
          }`}
        >
          {/* {message.id}
          <br /> */}
          {message.content}
        </div>

        <div
          className={`mt-1 flex gap-1 text-[10px] ${
            isSentByTeam
              ? "justify-end text-right text-rose-700"
              : "justify-start text-left text-zinc-600"
          }`}
        >
          {format(new Date(message.createdAt), "hh:mm a")}
          {/* {isOwn && getStatusIcon(message.status)} */}
        </div>
      </div>
    </div>
  );
}

type StatusConfig = {
  [key: string]: {
    label: string;
    color: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  };
};

const statusConfig: StatusConfig = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  VERIFYING: {
    label: "Verifying",
    color: "bg-yellow-100 text-yellow-700",
    icon: ShieldEllipsis,
  },
  APPROVED: {
    label: "Paid",
    color: "bg-green-100 text-green-700",
    icon: Wallet,
  },
  DECLINED: {
    label: "Declined",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

export function PlanBubble({
  currentUserId,
  message,
  onAccept,
  onReject,
  participantName,
  //onPay,
}: {
  currentUserId: string;
  message: ITeamUserMessage;
  onAccept?: () => void;
  onReject?: () => void;
  participantName?: string;
  //onPay?: () => void;
}) {
  const isSentByTeam = !!message.senderTeamId;
  const isOwn = message.senderTeamId === currentUserId;
  const status = message.paymentPhase || "PENDING";
  const StatusIcon = statusConfig[status].icon;

  return (
    <div className={`mb-3 flex flex-col ${isSentByTeam ? "items-end" : "items-start"}`}>
      {isSentByTeam ? (
        <span className="text-xs text-muted-foreground mb-1 mr-1">
          {isOwn ? "You" : message.senderTeam ? addIdPrefix(message.senderTeam.internalId.toString(), message.senderTeam.role as any) : "Another Admin"}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground mb-1 ml-1">{participantName || "User"}</span>
      )}
      <div
        className={`group relative max-w-[75%] min-w-2xs overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-md ${
          isOwn
            ? "border-rose-300 bg-rose-50/80 dark:border-rose-800 dark:bg-rose-950/40"
            : isSentByTeam
            ? "border-indigo-300 bg-indigo-50/80 dark:border-indigo-800 dark:bg-indigo-950/40"
            : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <div className="rounded-full bg-rose-100 p-1 dark:bg-rose-900/40">
              <CreditCard className="h-4 w-4 text-rose-500" />
            </div>
            <span className="tracking-wide">Payment Request</span>
          </div>

          <Badge
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusConfig[status].color}`}
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig[status].label}
          </Badge>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 p-2">
          <div className="bg-primary/20 flex justify-between gap-1 rounded-lg border p-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{message.planTitle}</span>
              <span className="text-muted-foreground text-xs">
                Duration: {message.planDuration} days
              </span>
            </div>
            <div className="flex items-center gap-1 text-3xl font-bold text-rose-600 dark:text-rose-400">
              <IndianRupee className="h-6 w-6" />
              {message.planPrice}
            </div>
          </div>

          {message.content && (
            <div className="max-w-xs rounded-lg p-1 text-sm">
              {message.content}
            </div>
          )}
        </div>

        {/* Actions */}
        {status === "PENDING" && !isOwn && (
          <div className="flex gap-3 border-t bg-zinc-50 px-4 py-3 dark:bg-zinc-800/40">
            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              onClick={onReject}
            >
              Reject
            </Button>

            <Button
              className="flex-1 bg-rose-600 hover:bg-rose-700"
              size="sm"
              onClick={onAccept}
            >
              Pay Now
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end border-t px-4 py-2 text-[11px] text-zinc-500">
          {format(new Date(message.createdAt), "hh:mm a")}
        </div>
      </div>
    </div>
  );
}
