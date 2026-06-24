// components/ChatContainer.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  CircleX,
  Clock,
  CreditCard,
  IndianRupee,
  MailIcon,
  MessageCircleIcon,
  PhoneCallIcon,
  PhoneIcon,
  Send,
  ShieldEllipsis,
  ShoppingCart,
  Wallet,
  XCircle,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTeamUserMessages } from "@/components/useTeamUserMessages";
import { UserGender } from "@/components/enum/userGender";
import { format, isToday, isYesterday } from "date-fns";
import LoadingPage from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { ITeamUserMessage } from "@/components/interface/ITeamUserChat";
import { AxiosResponse } from "@/components/interface/AxiosResponse";
import api from "@/lib/axiosInstance";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import SubmitLoadingView from "@/components/submitLoadingView";
import { companyDetails } from "@/components/helper/constant";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import MobileHeader from "@/components/dashboard/MobileHeader";

interface ChatContainerProps {
  conversationId: string;
  currentUserId: string;
}

export const ChatTeamClient: React.FC<ChatContainerProps> = ({
  conversationId,
  currentUserId,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");

  const [input, setInput] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (topic && !input && !selectedTopic) {
      setSelectedTopic(topic);
    }
  }, [topic]);

  const {
    messages,
    sendMessage,
    isLoading,
    participants,
    startConversation,
    rejectPayment,
  } = useTeamUserMessages(conversationId, currentUserId);

  //   const { startTyping, stopTyping, isReceiverTyping } = useTypingIndicator(
  //     participants?.id || "",
  //     conversationId
  //   );

  useEffect(() => {
    startConversation();
  }, [startConversation]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const removeTeamConversation = useNotificationStore(state => state.removeTeamConversation);

  useEffect(() => {
    scrollToBottom();
    if (conversationId) {
      removeTeamConversation(conversationId);
    }
  }, [messages, conversationId, removeTeamConversation]);

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
      <div className="w-full flex items-center justify-center gap-2 py-2">
        <span className="bg-zinc-200 dark:bg-zinc-800 text-sm px-2 py-1 rounded-full border shadow-md">
          {dateString}
        </span>
      </div>
    );
  };

  //   if (isLoading) {
  //     return <LoadingPage />;
  //   }
  //   const handleSendMessage = (content: string) => {
  //     sendMessage(content);
  //     stopTyping();
  //   };

  //   const handleInputChange = (value: string) => {
  //     if (value.trim()) {
  //       startTyping();
  //     } else {
  //       stopTyping();
  //     }
  //   };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (input.trim()) {
      if (selectedTopic) {
        sendMessage(`[TOPIC:${selectedTopic}] ${input}`);
        setSelectedTopic(null);
      } else {
        sendMessage(input);
      }
      setInput("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  return (
    <div className="flex flex-row flex-1 min-h-0 overflow-hidden w-full fixed top-0 left-0 right-0 h-[100dvh] z-40 md:relative md:h-auto md:z-auto bg-white dark:bg-zinc-950">

      {/* ─── LEFT: Chat ─── */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 py-2 px-4 border-b border-zinc-200/50 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-950 shadow-sm z-10 relative">
          <Button
            onClick={() => router.back()}
            variant={"ghost"}
            className="rounded-full w-8 h-8 p-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <Avatar className="h-10 w-10 bg-card border ring-1 ring-rose-400 ring-offset-2 ring-offset-card">
            <AvatarImage
              src={
                participants?.gender === UserGender.MALE
                  ? "/groom.webp"
                  : "/bride.webp"
              }
              alt="Avatar"
              width={40}
              height={40}
            />
            <AvatarFallback>
              {participants?.gender.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col justify-center">
            <h1 className="text-base font-semibold leading-tight">Support</h1>
            <span className="flex items-center gap-1.5 text-[10px] text-green-600 font-semibold mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Online
            </span>
          </div>

          {/* Quick mobile navigation since the main nav is hidden */}
          <MobileHeader hideLogo={true} className="flex md:hidden items-center ml-auto shrink-0 z-40 bg-transparent border-none p-0" />
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {renderDateSeparator(new Date(date))}
                {msgs.map((message) =>
                  message.type === "PAYMENT" ? (
                    <PlanBubble
                      key={message.id}
                      currentUserId={currentUserId}
                      message={message}
                      onReject={() => rejectPayment(message.id)}
                      onPay={() =>
                        router.push(
                          `/users/plan?pid=${message.planId}&ref=${message.senderTeamId}&mid=${message.id}`,
                        )
                      }
                    />
                  ) : (
                    <MessageBubble
                      key={message.id}
                      currentUserId={currentUserId}
                      message={message}
                    />
                  ),
                )}
              </div>
            ))}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col p-4 border-t shrink-0 relative bg-white dark:bg-zinc-950"
        >
          {/* Floating Context Block */}
          {selectedTopic && (
            <div className="absolute bottom-full left-4 mb-2 max-w-[80%] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-sm flex items-center justify-between p-3 z-10">
              <div className="flex flex-col min-w-0 pr-4">
                <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider mb-0.5">Topic Context</span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{selectedTopic}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedTopic(null)}
                className="w-6 h-6 rounded-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors shrink-0"
              >
                <CircleX className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
          )}

          <div className="flex gap-2 items-center relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={"Type a message..."}
              className="flex-1 rounded-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 outline-none"
              maxLength={1000}
            />

            <Button
              type="submit"
              disabled={!input.trim()}
              className="rounded-full bg-primary text-white disabled:opacity-50"
              size={"icon"}
            >
              <Send />
            </Button>
          </div>
        </form>
      </div>

      {/* ─── RIGHT: Contact Support Sidebar ─── */}
      <div className="hidden xl:flex w-[300px] shrink-0 flex-col gap-4 border-l border-zinc-100 dark:border-zinc-800 p-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-white dark:bg-zinc-950">

        {/* Header */}
        <div>
          <h2 className="text-sm font-extrabold text-[#1a1b4b] dark:text-white">Contact Support</h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">We&apos;re here to help you</p>
        </div>

        {/* Support Options */}
        <div className="flex flex-col gap-2">

          {/* Live Chat */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 bg-green-50/50 dark:bg-green-950/10 hover:border-green-200 dark:hover:border-green-800 transition-colors cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <MessageCircleIcon className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">Live Chat</p>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500">Avg. response: Under 2 min</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full">Online</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
          </div>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/91${companyDetails.contactNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-[#25D366]/40 dark:hover:border-[#25D366]/30 transition-colors cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
              <PhoneIcon className="w-4 h-4 text-[#25D366]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">WhatsApp Support</p>
              <p className="text-[10px] text-[#25D366] font-semibold">+91 {companyDetails.contactNumber}</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#25D366] transition-colors shrink-0" />
          </a>

          {/* Email */}
          <a
            href={`mailto:${companyDetails.email}`}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-800/40 transition-colors cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center shrink-0">
              <MailIcon className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">Email Support</p>
              <p className="text-[10px] text-blue-500 font-semibold truncate">{companyDetails.email}</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" />
          </a>

        </div>


        {/* Tips */}
        <div className="rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 p-3 space-y-1.5">
          <p className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider">💡 Quick Tips</p>
          <ul className="space-y-1">
            {["Describe your issue clearly", "Share your Profile ID if asked", "Check FAQs for instant answers", "Be patient — our team replies within minutes", "Avoid sharing your password with anyone", "Screenshot errors to share with support"].map((tip) => (
              <li key={tip} className="flex items-start gap-1.5 text-[10px] text-gray-500 dark:text-zinc-400">
                <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
};

export function MessageBubble({
  currentUserId,
  message,
}: {
  currentUserId: string;
  message: ITeamUserMessage;
}) {
  const isOwn = message.senderUserId === currentUserId;

  let topic: string | null = null;
  let text = message.content;

  if (text.startsWith("[TOPIC:")) {
    const endIdx = text.indexOf("]");
    if (endIdx !== -1) {
      topic = text.substring(7, endIdx);
      text = text.substring(endIdx + 1).trim();
    }
  }

  return (
    <div className={`mb-3 flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
      {isOwn ? (
        <span className="text-xs text-muted-foreground mb-1 mr-1">You</span>
      ) : (
        <span className="text-xs text-muted-foreground mb-1 ml-1">Support Team</span>
      )}

      {topic ? (
        // Premium Card UI for Topic Context
        <div
          className={`group relative max-w-[75%] min-w-2xs overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-md border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <div className="rounded-full bg-amber-100 p-1 dark:bg-amber-900/40">
                <Info className="h-4 w-4 text-amber-500" />
              </div>
              <span className="tracking-wide">Topic Context</span>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-3 p-2">
            <div className="bg-amber-100/70 dark:bg-amber-900/40 flex justify-between gap-1 rounded-lg border border-amber-200 dark:border-amber-800/60 p-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-amber-800 dark:text-amber-300">{topic}</span>
                <span className="text-muted-foreground text-xs">
                  Help Center Category
                </span>
              </div>
            </div>

            {text && (
              <div className="max-w-full break-words rounded-lg p-1 text-sm text-zinc-800 dark:text-zinc-200">
                {text}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end border-t px-4 py-2 text-[11px] text-zinc-500">
            {format(new Date(message.createdAt), "hh:mm a")}
          </div>
        </div>
      ) : (
        // Standard Chat Bubble UI
        <div className="relative flex max-w-[75%] flex-col">
          <div
            className={`rounded-2xl px-4 py-2 break-words shadow-sm ${
              isOwn
                ? "rounded-br-none bg-rose-500 text-white"
                : "rounded-bl-none bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            }`}
          >
            {text}
          </div>

          <div
            className={`mt-1 flex gap-1 text-[10px] ${
              isOwn
                ? "justify-end text-right text-rose-700"
                : "justify-start text-left text-zinc-600"
            }`}
          >
            {format(new Date(message.createdAt), "hh:mm a")}
          </div>
        </div>
      )}
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
  onReject,
  onPay,
}: {
  currentUserId: string;
  message: ITeamUserMessage;
  onReject?: () => void;
  onPay?: () => void;
}) {
  const router = useRouter();
  const [fetchingPayId, setFetchingPayId] = useState(false);
  const isOwn = message.senderTeamId === currentUserId;
  const status = message.paymentPhase || "PENDING";
  const StatusIcon = statusConfig[status].icon;

  const fetchPaymentId = async () => {
    setFetchingPayId(true);
    try {
      const response = await api.get<AxiosResponse<string>>(
        `/users/payment/${message.id}`,
      );
      router.push(`/users/payments/${response.data.data}/status`);
    } catch (error) {
      const errMessage = isAxiosError(error)
        ? error.message
        : "An error occurred";
      toast.error(errMessage);
    }
    setFetchingPayId(false);
  };

  return (
    <div className={`mb-3 flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
      {isOwn ? (
        <span className="text-xs text-muted-foreground mb-1 mr-1">You</span>
      ) : (
        <span className="text-xs text-muted-foreground mb-1 ml-1">Support Team</span>
      )}
      <div
        className={`group relative max-w-[75%] min-w-2xs overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-md ${
          isOwn
            ? "border-rose-300 bg-rose-50/80 dark:border-rose-800 dark:bg-rose-950/40"
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
              <CircleX className="h-4 w-4" />
              Reject
            </Button>

            <Button
              className="flex-1 bg-rose-600 hover:bg-rose-700"
              size="sm"
              onClick={onPay}
            >
              <ShoppingCart className="h-4 w-4" />
              Purchase
            </Button>
          </div>
        )}

        {(status === "APPROVED" ||
          status === "VERIFYING" ||
          status === "REJECTED") &&
          !isOwn && (
            <div className="border-t px-4 py-3">
              <Button
                className="w-full"
                size="sm"
                onClick={fetchPaymentId}
                disabled={fetchingPayId}
              >
                {fetchingPayId ? (
                  <SubmitLoadingView text="Please wait" />
                ) : (
                  "View Payment"
                )}
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
