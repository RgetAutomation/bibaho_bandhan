"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Clock,
  CreditCard,
  IndianRupee,
  Send,
  XCircle,
  Wallet,
  ShieldEllipsis,
  CheckCircle2,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { useGhotokUserSAMessages } from "@/components/useGhotokUserSAMessage";
import { IGhotokUserSAMessage } from "@/components/interface/ghotok/IGhotokSaChat";
import ButtonLoading from "@/components/buttonLoading";
import toast from "react-hot-toast";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";

export default function GhotoUserSaChatClientPage({
  convId,
  userId,
}: {
  convId: string;
  userId: string;
}) {
  const {
    messages,
    participantId,
    sendMessage,
    isLoading,
    startConversation,
    rejectPayment,
  } = useGhotokUserSAMessages(convId, userId);
  const router = useRouter();
  const [inputMessage, setInputMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    startConversation();
  }, [startConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    sendMessage(inputMessage.trim() || "");
    setInputMessage(""); // clear selected message
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

  return isLoading || !participantId ? (
    <div className={"flex flex-1 items-center justify-center"}>
      <Loader />
    </div>
  ) : (
    <div className="flex h-[calc(100vh-80px)] flex-col overflow-hidden">
      {/* Header */}
      <div className="item-center flex gap-3 border-b p-3">
        <Button
          variant="ghost"
          size={"icon"}
          className="rounded-full"
          onClick={() => router.back()}
        >
          <ArrowLeft />
        </Button>
        <Avatar className="size-10">
          <AvatarImage src={"/groom.webp"} />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <div className="flex w-full items-center justify-between">
          <h1 className="flex items-center text-center text-lg font-semibold">
            TEAM
          </h1>
        </div>
      </div>

      {/* Messages */}
      <div className={"flex-1 overflow-y-auto"}>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {renderDateSeparator(new Date(date))}
              {msgs.map((message: IGhotokUserSAMessage) =>
                message.type === "PAYMENT" ? (
                  <PaymentBubble
                    key={message.id}
                    currentUserId={userId}
                    message={message}
                    onReject={() => rejectPayment(message.id)}
                    onPay={() =>
                      router.push(
                        `/dashboard/ghotok/matching/payment/${message.id}`
                      )
                    }
                    onView={() =>
                      router.push(
                        `/dashboard/ghotok/matching/payment/success/${message.id}`
                      )
                    }
                  />
                ) : message.type === "PROFILE" ? (
                  <ProfileBubble
                    key={message.id}
                    id={message.id}
                    content={message.content}
                    isOwn={message.senderId === userId}
                    createdAt={message.createdAt}
                  />
                ) : (
                  <MessageBubble
                    key={message.id}
                    currentUserId={userId}
                    message={message}
                  />
                )
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section */}
      <div className="flex w-full items-start justify-center gap-2 border-t p-5">
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

        <Button
          className="rounded-full"
          disabled={!inputMessage?.trim()}
          onClick={handleSendMessage}
        >
          <Send />
        </Button>
      </div>
    </div>
  );
}

export function MessageBubble({
  currentUserId,
  message,
}: {
  currentUserId: string;
  message: IGhotokUserSAMessage;
}) {
  const isOwn = message.senderId === currentUserId;
  return (
    <div className={`mb-3 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className="relative flex max-w-[70%] flex-col">
        <div
          className={`rounded-2xl px-4 py-2 break-words shadow-sm ${
            isOwn
              ? "rounded-br-none bg-rose-500 text-white"
              : "rounded-bl-none bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
          }`}
        >
          {/* {message.id}
          <br /> */}
          {message.content}
        </div>

        <div
          className={`mt-1 flex gap-1 text-[10px] ${
            isOwn
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

export function PaymentBubble({
  currentUserId,
  message,
  onReject,
  onPay,
  onView,
}: {
  currentUserId: string;
  message: IGhotokUserSAMessage;
  onReject?: () => void;
  onPay?: () => void;
  onView?: () => void;
}) {
  const isOwn = message.senderId === currentUserId;
  const status = message.paymentPhase || "PENDING";
  const StatusIcon = statusConfig[status].icon;

  return (
    <div className={`mb-3 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] min-w-2xs overflow-hidden rounded-2xl border shadow-sm ${
          isOwn
            ? "border-rose-400 bg-rose-50 dark:bg-rose-950/40"
            : "dark:border-primary/50 border-zinc-300 bg-white dark:bg-zinc-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b px-4 py-2 text-sm font-medium">
          <CreditCard className="h-4 w-4 text-rose-500" />
          <span>Payment Request</span>
        </div>

        {/* Body */}
        <div className="w-full space-y-2 px-4 py-3">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-2xl font-semibold">
              <IndianRupee className="h-5 w-5" />
              {message.price}
            </div>

            <Badge
              className={`flex items-center gap-1 rounded-full text-xs ${statusConfig[status].color}`}
            >
              <StatusIcon className="h-3 w-3" />
              {statusConfig[status].label}
            </Badge>
          </div>

          {message.content && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {message.content}
            </p>
          )}
        </div>

        {/* Actions */}
        {status === "PENDING" && !isOwn && (
          <div className="flex gap-2 border-t px-4 py-3">
            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              onClick={onReject}
            >
              <XCircle className="h-4 w-4" /> Decline
            </Button>
            <Button className="flex-1" size="sm" onClick={onPay}>
              <CheckCircle2 className="h-4 w-4" /> Pay
            </Button>
          </div>
        )}

        {(status === "PAID" || status === "VERIFYING") && !isOwn && (
          <div className="border-t px-4 py-3">
            <Button className="w-full" size="sm" onClick={onView}>
              View
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end border-t px-4 py-2 text-[10px] text-zinc-500">
          {format(new Date(message.createdAt), "hh:mm a")}
          {/* {isOwn && getStatusIcon(message.status)} */}
        </div>
      </div>
    </div>
  );
}

export function ProfileBubble({
  id,
  content,
  isOwn,
  createdAt,
}: {
  id: string;
  content: string;
  isOwn: boolean;
  createdAt: Date;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [publicId, userName, avatar] = content.split(";");

  const handleViewProfile = async () => {
    try {
      setLoadingId(id);
      const response = await api.get<AxiosResponse<{ userId: string }>>(
        `/app/ghotok/bride/publicId/${publicId}`
      );

      if (response.data.success) {
        const userId = response.data.data;
        if (userId) {
          router.push(`/dashboard/ghotok/profile/public/${userId}`);
        } else {
          toast.error("Failed to get user details");
        }
      }
    } catch (error) {
      setLoadingId(null);
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={`mb-4 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative flex max-w-[75%] min-w-2xs overflow-hidden rounded-2xl border shadow-sm ${
          isOwn
            ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-950/40"
            : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        } `}
      >
        {/* Accent strip */}
        <div className="w-1 bg-gradient-to-b from-rose-500 to-pink-500" />

        <div className="flex w-full flex-col">
          <div className="flex gap-4 p-4">
            {/* Avatar */}
            <Avatar className="size-16 shrink-0 ring-2 ring-rose-400/40">
              <AvatarImage src={avatar || ""} />
              <AvatarFallback className="bg-rose-500 text-lg font-semibold text-white">
                {userName?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex min-w-0 flex-col justify-center gap-1">
              <h2 className="truncate text-lg font-semibold">{userName}</h2>

              <p className="text-muted-foreground text-sm">
                Profile ID:
                <span className="ml-1 font-medium">{publicId}</span>
              </p>

              {/* CTA */}
              <Button
                variant="ghost"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-rose-600 dark:text-rose-400"
                onClick={handleViewProfile}
                disabled={loadingId === id}
              >
                {loadingId === id ? (
                  <ButtonLoading text="Please wait" />
                ) : (
                  <>
                    View profile
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-end border-t px-4 py-2 text-[10px] text-zinc-500">
            {format(new Date(createdAt), "hh:mm a")}
            {/* {isOwn && getStatusIcon(status)} */}
          </div>
        </div>
      </div>
    </div>
  );
}
