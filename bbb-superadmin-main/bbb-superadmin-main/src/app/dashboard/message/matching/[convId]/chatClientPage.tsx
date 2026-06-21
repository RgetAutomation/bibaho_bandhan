"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  Send,
  XCircle,
  Wallet,
  ShieldEllipsis,
  UserRound,
  EllipsisVertical,
  Ban,
  Hourglass,
  Info,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { UserGender } from "@/components/enum/userGender";
import { useSaUserMessages } from "@/components/useSaUserMessage";
import {
  MessageDeliveredIcon,
  MessageReadIcon,
  MessageSendIcon,
} from "@/components/resource/image/icons/message-status";
import { ISaUserMessage } from "@/components/interface/ISaUserChat";
import { Badge } from "@/components/ui/badge";
import { IBrideProfileForChat } from "@/components/interface/IUsers";
import toast from "react-hot-toast";
import { getBrideProfileIdByPublicId } from "@/action/bride";
import ButtonLoading from "@/components/buttonLoading";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { rejectMatchingReportById } from "@/action/matching";

export default function TeamChatClientPage({
  convId,
  userId,
  reportId,
  bride,
}: {
  convId: string;
  userId: string;
  reportId: string;
  bride: IBrideProfileForChat | null;
}) {
  const {
    messages,
    sendMessage,
    sendPaymentMessage,
    sendProfileMessage,
    isLoading,
    participant,
    // conversationId,
    startConversation,
  } = useSaUserMessages(convId, userId);
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [inputPrice, setInputPrice] = useState<string>("");
  const [inputDescription, setInputDescription] = useState<string>("");
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<
    "TEXT" | "PAYMENT" | "PROFILE"
  >("TEXT");
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
    if (messageType === "PAYMENT") {
      sendPaymentMessage(inputPrice, inputDescription, reportId);
      setInputPrice("");
      setInputDescription("");
      setMessageType("TEXT");
    }

    if (messageType === "PROFILE") {
      if (!bride) return;
      sendProfileMessage(bride);
      setMessageType("TEXT");
    }

    if (messageType === "TEXT") {
      const matchPrefix = bride?.publicId ? `[Match: ${bride.publicId}]: ` : "";
      sendMessage(`${matchPrefix}${inputMessage.trim()}`);
      setInputMessage(""); // clear selected message
    }
  };

  const handleRejectMatchingReport = async () => {
    try {
      const response = await rejectMatchingReportById(reportId);
      if (response.success) {
        toast.success(response.message);
        router.push("/dashboard/matching-room");
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Failed to reject matching report. Please try again.");
    }
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

  return isLoading || !participant ? (
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
        <Link href={`/dashboard/profile/user/${participant?.id}`}>
          <Avatar className="size-10">
            <AvatarImage
              src={
                participant?.avatar
                  ? participant?.avatar
                  : participant?.gender === UserGender.MALE
                    ? "/groom.webp"
                    : "/bride.webp"
              }
            />
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex w-full items-center justify-between">
          <Link href={`/dashboard/profile/user/${participant?.id}`}>
            <h1 className="flex items-center text-center text-lg font-semibold">
              {participant?.firstName} {participant?.middleName}{" "}
              {participant?.lastName}
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            {bride?.id && (
              <>
                <Button
                  className="rounded-full"
                  onClick={() =>
                    setMessageType(messageType !== "PROFILE" ? "PROFILE" : "TEXT")
                  }
                >
                  <UserRound className="h-4 w-4" />
  
                  {/* Desktop label */}
                  <span className="hidden sm:inline">Profile</span>
                </Button>
                <Button
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    const matchPrefix = bride?.publicId ? `[Match: ${bride.publicId}]: ` : "";
                    sendMessage(`${matchPrefix}MATCH_CONFIRMATION_POLL`);
                  }}
                >
                  <span className="hidden sm:inline">Send Poll</span>
                </Button>
              </>
            )}

            {reportId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent sideOffset={10} align="end">
                  <DropdownMenuItem
                    className="p-2"
                    onClick={() =>
                      setMessageType(
                        messageType !== "PAYMENT" ? "PAYMENT" : "TEXT"
                      )
                    }
                  >
                    <IndianRupee className="h-4 w-4" />
                    <span>Payment</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setOpen(true);
                    }}
                    className="p-2"
                  >
                    <Ban />
                    Reject Matching Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* AlertDialog outside DropdownMenu */}
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you want to Reject?</AlertDialogTitle>
                <AlertDialogDescription>
                  Do you really want to reject this matching report? It cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRejectMatchingReport}>
                  Yes, Reject
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Messages */}
      <div className={"flex-1 overflow-y-auto"}>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {renderDateSeparator(new Date(date))}
              {msgs.map((message: ISaUserMessage) =>
                message.type === "PAYMENT" ? (
                  <PaymentBubble
                    key={message.id}
                    currentUserId={userId}
                    message={message}
                  />
                ) : message.type === "PROFILE" ? (
                  <ProfileBubble
                    key={message.id}
                    id={message.id}
                    content={message.content}
                    isOwn={message.senderId === userId}
                    createdAt={message.createdAt}
                    status={message.status}
                  />
                ) : message.content.includes("MATCH_CONFIRMATION_POLL") ? (
                  (() => {
                    const answerMsg = messages.find(m => 
                      new Date(m.createdAt).getTime() > new Date(message.createdAt).getTime() && 
                      (m.content.includes("Yes, Match Is Final") || 
                       m.content.includes("No, Still Under Discussion") || 
                       m.content.includes("Need More Time:"))
                    );
                    let answeredWith = null;
                    if (answerMsg) {
                      if (answerMsg.content.includes("Yes, Match Is Final")) answeredWith = "Yes, Match Is Final";
                      else if (answerMsg.content.includes("No, Still Under Discussion")) answeredWith = "No, Still Under Discussion";
                      else {
                        const match = answerMsg.content.match(/Need More Time: .* Days/);
                        if (match) answeredWith = match[0];
                      }
                    }

                    return (
                      <PollBubble 
                        key={message.id} 
                        currentUserId={userId} 
                        message={message} 
                        answeredWith={answeredWith}
                        onRespond={(text) => sendMessage(text)} 
                      />
                    );
                  })()
                ) : (message.content.includes("Yes, Match Is Final") || 
                     message.content.includes("No, Still Under Discussion") || 
                     message.content.includes("Need More Time:")) ? null : (
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
        <div className="flex w-full flex-col gap-2">
          {messageType === "PAYMENT" && (
            <>
              <Input
                type="number"
                className="rounded-full px-4"
                placeholder="Enter amount"
                value={inputPrice}
                onChange={(e) => setInputPrice(e.target.value)}
              />
              <Input
                className="rounded-full px-4"
                placeholder="Description"
                value={inputDescription}
                onChange={(e) => setInputDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
            </>
          )}
          {messageType === "TEXT" && (
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
          )}

          {messageType === "PROFILE" && <BrideCard bride={bride!} />}
        </div>

        <Button
          className="rounded-full"
          disabled={
            messageType === "PAYMENT"
              ? !inputPrice?.trim() || !inputDescription?.trim()
              : messageType === "PROFILE"
                ? !bride?.id
                : !inputMessage?.trim()
          }
          onClick={handleSendMessage}
        >
          <Send />
        </Button>
      </div>
    </div>
  );
}

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "READ":
      return <MessageReadIcon className="ml-1 size-4 text-green-600" />;
    case "DELIVERED":
      return <MessageDeliveredIcon className="ml-1 size-4" />;
    case "SENT":
      return <MessageSendIcon className="ml-1 size-4" />;
    default:
      return <Clock className="ml-1 size-4" />;
  }
};

export function MessageBubble({
  currentUserId,
  message,
}: {
  currentUserId: string;
  message: ISaUserMessage;
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
          {message.content.replace(/^\[Match:\s*[a-zA-Z0-9_-]+\]:\s*/i, '')}
        </div>

        <div
          className={`mt-1 flex gap-1 text-[10px] ${
            isOwn
              ? "justify-end text-right text-rose-700"
              : "justify-start text-left text-zinc-600"
          }`}
        >
          {format(new Date(message.createdAt), "hh:mm a")}
          {isOwn && getStatusIcon(message.status)}
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
  onAccept,
  onReject,
  //onPay,
}: {
  currentUserId: string;
  message: ISaUserMessage;
  onAccept?: () => void;
  onReject?: () => void;
  //onPay?: () => void;
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
            : "border-zinc-300 bg-white dark:bg-zinc-900"
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
              Reject
            </Button>
            <Button className="flex-1" size="sm" onClick={onAccept}>
              Pay
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end border-t px-4 py-2 text-[10px] text-zinc-500">
          {format(new Date(message.createdAt), "hh:mm a")}
          {isOwn && getStatusIcon(message.status)}
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
  status,
}: {
  id: string;
  content: string;
  isOwn: boolean;
  createdAt: Date;
  status: string;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [publicId, userName, avatar] = content.split(";");

  const handleViewProfile = async () => {
    try {
      setLoadingId(id);
      const userId = await getBrideProfileIdByPublicId(publicId);
      if (userId) {
        router.push(`/dashboard/profile/user/${userId}`);
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
            {isOwn && getStatusIcon(status)}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrideCard({ bride }: { bride: IBrideProfileForChat }) {
  return (
    <div
      className={`bg-card flex items-center gap-4 rounded-2xl border p-3 shadow-md`}
    >
      <Avatar className={"size-15"}>
        <AvatarImage
          src={
            bride.avatar
              ? bride.avatar
              : bride.gender === "MALE"
                ? "/groom.webp"
                : "/bride.webp"
          }
        />
        <AvatarFallback>{bride.firstName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className={"flex w-full flex-col"}>
        <div className="flex w-full items-center justify-between">
          <h1 className={"text-lg font-semibold"}>
            {bride.firstName} {bride.middleName} {bride.lastName}
          </h1>
        </div>
        <p className={"text-muted-foreground text-sm"}>ID: {bride.publicId}</p>
      </div>
    </div>
  );
}

export function PollBubble({ currentUserId, message, answeredWith, onRespond }: { currentUserId: string, message: ISaUserMessage, answeredWith?: string | null, onRespond?: (text: string) => void }) {
  const isOwn = message.senderId === currentUserId;
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [customTime, setCustomTime] = useState<string>("");

  if (answeredWith) {
    let colorClass = "";
    let icon = null;
    let title = null;
    let subtitle = "";

    if (answeredWith === "Yes, Match Is Final") {
      colorClass = "bg-gradient-to-b from-green-500 to-emerald-500";
      icon = <CheckCircle2 className="w-5 h-5 text-green-600"/>;
      title = <span className="text-green-600">Yes, Match Is Final</span>;
      subtitle = "I confirm that this match has reached a final agreement.";
    } else if (answeredWith === "No, Still Under Discussion") {
      colorClass = "bg-gradient-to-b from-rose-500 to-pink-500";
      icon = <XCircle className="w-5 h-5 text-rose-600"/>;
      title = <span className="text-rose-600">No, Still Under Discussion</span>;
      subtitle = "We are still discussing and not final yet.";
    } else {
      colorClass = "bg-gradient-to-b from-orange-500 to-amber-500";
      icon = <Hourglass className="w-5 h-5 text-orange-600"/>;
      title = <span className="text-orange-600">{answeredWith}</span>;
      subtitle = "An extension has been requested.";
    }

    return (
      <div className={`mb-4 flex ${isOwn ? "justify-end" : "justify-start"}`}>
        <div className="relative flex max-w-[60%] min-w-[220px] overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          {/* Accent strip */}
          <div className={`w-1 shrink-0 ${colorClass}`} />
          
          <div className="flex w-full flex-col">
            <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center">
              <h4 className="font-bold flex items-center justify-center gap-1.5 text-base">
                {icon}
                {title}
              </h4>
              <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mt-0.5">{subtitle}</p>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end border-t border-zinc-100 dark:border-zinc-800 px-3 py-1.5 text-[10px] text-zinc-500">
              {format(new Date(message.createdAt), "hh:mm a")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-3 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col md:flex-row gap-3 w-full max-w-2xl bg-white dark:bg-zinc-900 p-4 rounded-xl border shadow-sm">
        
        {/* Need More Time Card */}
        <div className="flex-1 p-3 border border-orange-200 bg-orange-50 dark:bg-orange-950/30 rounded-lg flex flex-col gap-2">
          <h4 className="font-bold text-orange-600 flex items-center justify-center gap-1"><Hourglass className="w-4 h-4"/> Need More Time</h4>
          
          <div className="grid grid-cols-2 gap-2 text-sm text-zinc-700 dark:text-zinc-300 mt-2 pl-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`time-${message.id}`} value="7" onChange={(e) => setSelectedTime(e.target.value)} className="accent-orange-500 w-4 h-4" />
              7 Days
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`time-${message.id}`} value="15" onChange={(e) => setSelectedTime(e.target.value)} className="accent-orange-500 w-4 h-4" />
              15 Days
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`time-${message.id}`} value="30" onChange={(e) => setSelectedTime(e.target.value)} className="accent-orange-500 w-4 h-4" />
              30 Days
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`time-${message.id}`} value="custom" onChange={(e) => setSelectedTime(e.target.value)} className="accent-orange-500 w-4 h-4" />
              Custom
            </label>
          </div>

          {selectedTime === "custom" && (
            <input 
              type="text" 
              placeholder="Enter days" 
              className="mt-1 px-3 py-1.5 text-sm border border-orange-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white dark:bg-zinc-800"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
            />
          )}

          <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1 pl-1">
             <Info className="w-3 h-3" /> (You can request one time only)
          </div>

          {((selectedTime && selectedTime !== "custom") || (selectedTime === "custom" && customTime)) ? (
            <button 
              onClick={() => {
                const val = selectedTime === "custom" ? customTime : selectedTime;
                if (onRespond && val) onRespond(`Need More Time: ${val} Days`);
              }}
              className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-2 rounded-full transition-colors font-medium cursor-pointer"
            >Submit Request</button>
          ) : null}
        </div>

        {/* Yes Match Is Final Card */}
        <div 
          onClick={() => onRespond && onRespond("Yes, Match Is Final")}
          className="flex-1 p-3 border border-green-200 bg-green-50 dark:bg-green-950/30 rounded-lg flex flex-col justify-center text-center cursor-pointer hover:bg-green-100 transition-colors"
        >
          <h4 className="font-bold text-green-600 flex items-center justify-center gap-1"><CheckCircle2 className="w-5 h-5"/> Yes, Match Is Final</h4>
          <p className="text-[11px] text-green-800/80 mt-3 font-medium">I confirm that this match has reached a final agreement.</p>
        </div>

        {/* No Still Under Discussion Card */}
        <div 
          onClick={() => onRespond && onRespond("No, Still Under Discussion")}
          className="flex-1 p-3 border border-rose-200 bg-rose-50 dark:bg-rose-950/30 rounded-lg flex flex-col justify-center text-center cursor-pointer hover:bg-rose-100 transition-colors"
        >
          <h4 className="font-bold text-rose-600 flex items-center justify-center gap-1"><XCircle className="w-5 h-5"/> No, Still Under Discussion</h4>
          <p className="text-[11px] text-rose-800/80 mt-3 font-medium">We are still discussing and not final yet.</p>
        </div>

      </div>
    </div>
  );
}
