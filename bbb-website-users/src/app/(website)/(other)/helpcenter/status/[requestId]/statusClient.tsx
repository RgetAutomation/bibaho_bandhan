"use client";

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
  MessageCircle,
  Phone,
  Reply,
  StarsIcon,
  Send,
  Loader2,
  RefreshCcw,
  Clock,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import CopyButton from "@/components/landing/copyButton";
import {
  getHelpRequestById,
  IHelpTicket,
  getHelpRequestMessages,
  sendHelpRequestMessage,
  IHelpRequestMessage,
  reopenTicket,
} from "@/actions/users";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyViewCard } from "@/components/emptyView";
import ApiErrorPage from "@/components/apiErrorPage";
import { isAxiosError } from "axios";
import LoadingPage from "@/components/loader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import SubmitLoadingView from "@/components/submitLoadingView";
import { useState, useEffect, useRef, Fragment } from "react";
import { differenceInDays } from "date-fns";

export default function HelpRequestStatusClient({
  requestId,
}: {
  requestId: string;
}) {
  const { data, isLoading, isPending, error, isError } = useQuery({
    queryKey: ["help-request", requestId],
    queryFn: () => getHelpRequestById(requestId),
    enabled: !!requestId,
    refetchInterval: 5000, // Poll every 5s to get live status updates
  });

  if (isLoading || isPending) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen">
        <LoadingPage />
      </div>
    );
  }

  if (isError) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load profile"
      : "Something went wrong";

    return (
      <ApiErrorPage
        title={"Failed to load profile"}
        description={errorMessage}
      />
    );
  }

  if (!data)
    return (
      <EmptyViewCard
        title="Request not found"
        description="The requested help request was not found."
      />
    );
  return (
    <div className="py-6">
      <HelpTicketCard data={data} />
    </div>
  );
}

function HelpTicketCard({ data }: { data: IHelpTicket }) {
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500",
    INPROGRESS: data.isReopened ? "bg-purple-500" : "bg-blue-500",
    RESOLVED: "bg-green-600",
    CLOSED: "bg-gray-500",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "PENDING",
    INPROGRESS: data.isReopened ? "REOPENED" : "IN PROGRESS",
    RESOLVED: "RESOLVED",
    CLOSED: "CLOSED",
  };

  return (
    <div className="m-4 flex w-full max-w-6xl mx-auto flex-col gap-6 md:flex-row items-stretch h-[calc(100vh-8rem)]">
      {/* Left/Middle Column - Chat Box */}
      <div className="flex-1 flex flex-col rounded-2xl border bg-card shadow-lg overflow-hidden">
        <div className="bg-muted p-4 border-b">
          <h2 className="text-lg font-bold">Chat with Support</h2>
          <p className="text-sm text-muted-foreground">Support thread for request #{data.id.slice(-6)}</p>
        </div>
        <div className="flex-1 overflow-hidden p-4 bg-background flex flex-col">
          <GuestHelpChatBox requestId={data.id} isResolved={data.status === "RESOLVED" || data.status === "CLOSED"} />
        </div>
      </div>

      {/* Right Column - User Details and Feedback Form */}
      <div className="flex w-full flex-col gap-4 md:w-[320px] shrink-0 overflow-y-auto pb-4 pr-1">
        <div className="bg-card flex flex-col rounded-2xl border p-4 shadow-lg">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-lg font-semibold">Ticket Details</h3>
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                statusColors[data.status] || "bg-gray-100 text-gray-800"
              }`}
            >
              <Info className="h-4 w-4" /> {statusLabels[data.status] ?? data.status}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="divide-border bg-card flex flex-col divide-y overflow-hidden rounded-xl border shadow-sm">
              <div className="flex items-center gap-2 p-3">
                <CheckCircle2 className="size-4 text-green-600" />
                <div className="text-md flex-1 font-bold break-all">
                  Thank you, {data.name}
                </div>
              </div>

              {/* Ticket ID */}
              <div className="flex items-center gap-2 px-3 py-1 bg-muted/50">
                <Info className="size-4 text-muted-foreground" />
                <div className="flex-1 text-xs font-mono break-all">
                  ID: {data.id}
                </div>
                <CopyButton text={data.id} />
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2 px-3 py-2">
                <Phone className="size-4 text-muted-foreground" />
                <div className="flex-1 text-sm break-all">+91 {data.phone}</div>
              </div>

              {/* Email */}
              {data.email && (
                <div className="flex items-center gap-2 px-3 py-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <div className="flex-1 text-sm break-all text-gray-700 dark:text-gray-200">
                    {data.email}
                  </div>
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="flex flex-col gap-2 rounded-xl border bg-gray-50 p-3 shadow-sm transition-shadow duration-200 hover:shadow-md dark:bg-zinc-800">
              <div className="flex items-center gap-2">
                <div className="text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0" />
                  <span className="leading-relaxed">Reason: </span>
                </div>
                <div className="flex-1 text-sm break-all font-semibold text-blue-600">
                  {data.reason}
                </div>
              </div>

              {data.message && (
                <div className="flex items-start gap-2 text-sm mt-1">
                  <div className="text-muted-foreground flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-medium">Message:</span>
                  </div>
                  <p>{data.message}</p>
                </div>
              )}
            </div>

            {data.adminNote && (
              <div className="bg-muted mt-1 flex flex-col gap-2 rounded-xl border p-3 text-sm">
                <div className="flex items-start gap-3">
                  <Reply className="text-muted-foreground mt-1 h-4 w-4 shrink-0" />
                  <span className="text-muted-foreground font-medium text-nowrap">
                    Team Reply:
                  </span>
                  <p className="w-full text-sm font-bold">{data.adminNote}</p>
                </div>
              </div>
            )}

            {data.feedback && data.status === "RESOLVED" && (
              <div className="bg-muted mt-1 flex flex-col gap-2 rounded-xl border p-3 text-sm">
                <div className="flex items-start gap-3">
                  <StarsIcon className="text-muted-foreground mt-1 h-4 w-4 shrink-0" />
                  <span className="text-muted-foreground font-medium text-nowrap">
                    Your Feedback:
                  </span>
                  <p className="w-full text-sm font-bold">{data.feedback}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reopen button: only shown when RESOLVED and within 7-day window */}
        {data.status === "RESOLVED" && (
          <div className="bg-card flex flex-col rounded-2xl border p-4 shadow-lg">
            <ReopenButton ticketId={data.id} resolvedAt={data.resolvedAt} />
          </div>
        )}

        {data.status === "CLOSED" && (
          <div className="bg-card flex flex-col rounded-2xl border border-gray-300 p-4 shadow-lg">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-2xl">🔒</span>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                This ticket has been permanently closed.
              </p>
              <p className="text-xs text-muted-foreground">
                The chat history has been cleared. The ticket details are kept for your reference.
              </p>
            </div>
          </div>
        )}

        <div className="mt-auto pt-2">
          <p className="text-start text-xs text-muted-foreground leading-relaxed">
            <span className="font-bold">Note:</span> Please bookmark this page
            or save your Ticket ID to check the status of your request later.
          </p>
        </div>
      </div>
    </div>
  );
}


function ReopenButton({
  ticketId,
  resolvedAt,
}: {
  ticketId: string;
  resolvedAt: string | null;
}) {
  const queryClient = useQueryClient();
  const [showInfo, setShowInfo] = useState(false);

  const daysLeft = resolvedAt
    ? Math.max(0, 7 - differenceInDays(new Date(), new Date(resolvedAt)))
    : 7;

  const isWindowExpired = daysLeft <= 0;
  const progressPercent = Math.round((daysLeft / 7) * 100);
  const isUrgent = daysLeft <= 2;

  const { mutate, isPending } = useMutation({
    mutationFn: () => reopenTicket(ticketId),
    onSuccess: () => {
      toast.success("Your ticket has been reopened! Our team will get back to you.");
      queryClient.invalidateQueries({ queryKey: ["help-request", ticketId] });
    },
    onError: (error: any) => {
      const msg = isAxiosError(error)
        ? error.response?.data?.message
        : "Failed to reopen ticket";
      toast.error(msg);
    },
  });

  if (isWindowExpired) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b">
        <div className={`p-1.5 rounded-full ${ isUrgent ? "bg-red-100 dark:bg-red-900/30" : "bg-orange-100 dark:bg-orange-900/30" }`}>
          <AlertTriangle className={`h-4 w-4 ${ isUrgent ? "text-red-500" : "text-orange-500" }`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold leading-tight">Problem not resolved?</p>
          <p className="text-xs text-muted-foreground">You can reopen this ticket to get more help</p>
        </div>
        {/* ⓘ Info toggle button */}
        <button
          type="button"
          onClick={() => setShowInfo((v) => !v)}
          className="p-1.5 rounded-full hover:bg-muted transition-colors shrink-0"
          title={showInfo ? "Hide info" : "What happens when I reopen?"}
        >
          <Info className={`h-4 w-4 transition-colors ${ showInfo ? "text-blue-500" : "text-muted-foreground" }`} />
        </button>
      </div>

      {/* Collapsible info box */}
      {showInfo && (
        <div className="bg-muted/50 rounded-xl p-3 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">What happens when you reopen</p>
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">Your ticket status returns to <span className="font-semibold text-blue-500">In Progress</span></p>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">The chat will unlock so you can explain further</p>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">Our team will be notified to continue assisting you</p>
          </div>
        </div>
      )}

      {/* Countdown progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            Reopen window
          </span>
          <span className={`font-bold ${ isUrgent ? "text-red-500" : daysLeft <= 4 ? "text-orange-500" : "text-green-600" }`}>
            {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${ isUrgent ? "bg-red-500" : daysLeft <= 4 ? "bg-orange-400" : "bg-green-500" }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          After {daysLeft} day{daysLeft !== 1 ? "s" : ""}, this ticket will be{" "}
          <span className="font-semibold text-foreground">closed</span>.
        </p>
      </div>

      {/* Reopen Button */}
      <Button
        className={`w-full gap-2 font-semibold ${ isUrgent ? "bg-red-600 hover:bg-red-700" : "bg-orange-500 hover:bg-orange-600" } text-white`}
        onClick={() => mutate()}
        disabled={isPending}
      >
        {isPending ? (
          <SubmitLoadingView text="Reopening your ticket..." />
        ) : (
          <>
            <RefreshCcw className="h-4 w-4" />
            My problem is still not fixed
          </>
        )}
      </Button>
    </div>
  );
}


function GuestHelpChatBox({ requestId, isResolved }: { requestId: string; isResolved: boolean }) {
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const prevLength = useRef(0);
  const [lastReadId, setLastReadId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLastReadId(localStorage.getItem(`help_chat_last_read_${requestId}`));
    }
  }, [requestId]);

  // Auto-hide the "New Messages" badge after 5 seconds of viewing it
  useEffect(() => {
    if (lastReadId) {
      const timer = setTimeout(() => {
        setLastReadId(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastReadId]);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["help-request-messages", requestId],
    queryFn: () => getHelpRequestMessages(requestId),
    refetchInterval: 5000, // Poll every 5s for guest
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (content: string) => sendHelpRequestMessage(requestId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["help-request-messages", requestId],
      });
    },
    onError: (error) => {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message
        : "Failed to send message";
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    if (messages.length > 0 && prevLength.current === 0) {
      setTimeout(() => {
        if (dividerRef.current) {
          dividerRef.current.scrollIntoView({ behavior: "instant", block: "center" });
        } else {
          bottomRef.current?.scrollIntoView({ behavior: "instant" });
        }
      }, 50);
      localStorage.setItem(`help_chat_last_read_${requestId}`, messages[messages.length - 1].id);
    } else if (messages.length > prevLength.current) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
      localStorage.setItem(`help_chat_last_read_${requestId}`, messages[messages.length - 1].id);
    }
    prevLength.current = messages.length;
  }, [messages, requestId]);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get("content") as string;
    if (!content.trim()) return;
    
    mutate(content);
    setLastReadId(null);
    e.currentTarget.reset();
  };

  if (isLoading) {
    return <div className="text-center py-4 text-sm text-muted-foreground">Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground mt-10">
            No messages yet. Send a message to start the conversation!
          </p>
        ) : (
          messages.map((msg: IHelpRequestMessage, index: number) => {
            const isGuest = msg.senderType === "GUEST";
            const isNewMessage = lastReadId && index > 0 && messages[index - 1].id === lastReadId;

            return (
              <Fragment key={msg.id}>
                {isNewMessage && (
                  <div ref={dividerRef} className="flex items-center justify-center my-4 w-full">
                    <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs border shadow-sm">
                      New Messages
                    </span>
                  </div>
                )}
                <div
                  className={`flex flex-col ${
                  isGuest ? "items-end" : "items-start"
                }`}
              >
                {!isGuest && (
                  <span className="text-xs text-muted-foreground mb-1 ml-1">
                    Support
                  </span>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm break-all ${
                    isGuest
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none border"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              </Fragment>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {isResolved ? (
        <div className="p-3 border-t bg-muted text-center text-sm text-muted-foreground">
          This request has been marked as resolved and the chat is closed.
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="p-3 border-t bg-background flex gap-2">
          <input
            name="content"
            placeholder="Type a message..."
            className="flex-1 bg-muted px-3 py-2 rounded-full text-sm outline-none border focus:border-blue-500"
            autoComplete="off"
            disabled={isPending}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full shrink-0 bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 transition-colors"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-[-2px]" />}
          </Button>
        </form>
      )}
    </div>
  );
}
