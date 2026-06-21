"use client";

import { 
  getSingleHelpRequestById,
  getHelpRequestMessages,
  sendAdminHelpMessage,
  IHelpRequestMessage
} from "@/actions/admin";
import ApiErrorPage from "@/components/apiErrorPage";
import ButtonLoading from "@/components/buttonLoading";
import LoadingPage from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { format } from "date-fns";
import { useState, useEffect, useRef, Fragment } from "react";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
  Check,
  Clipboard,
  Info,
  Mail,
  MessageSquare,
  Phone,
  Reply,
  StarsIcon,
  UserRound,
  Send,
  Loader2,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addIdPrefix } from "@/lib/utils";

export type RequestStatus = "PENDING" | "INPROGRESS" | "RESOLVED";
const FormSchema = z.object({
  status: z.enum(["PENDING", "INPROGRESS", "RESOLVED"]),
});

export default function RequestClientPage({
  requestId,
  currentUserId,
}: {
  requestId: string;
  currentUserId: string;
}) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    data: helpRequest,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["getSingleHelpRequestById", requestId],
    queryFn: () => getSingleHelpRequestById(requestId),
    enabled: !!requestId,
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      status: (helpRequest?.status as RequestStatus) || "PENDING",
    },
  });

  useEffect(() => {
    if (helpRequest) {
      form.reset({
        status: (helpRequest.status as RequestStatus) || "PENDING",
      });
    }
  }, [helpRequest, form]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load data"
      : "Something went wrong. Please try again.";

    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <ApiErrorPage
          title="Failed to load request"
          description={errorMessage}
        />
      </div>
    );
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsUpdating(true);
    try {
      const response = await api.post<AxiosResponse<null>>(
        "/app/admin/request/help/update",
        {
          requestId: requestId,
          status: data.status,
        }
      );
      if (response.data.success) {
        form.reset();
        toast.success("Status updated successfully");
        refetch();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || "Failed to update status"
        : "Something went wrong. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }

  if (!helpRequest) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    INPROGRESS: helpRequest.isReopened ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800",
    RESOLVED: "bg-green-100 text-green-800",
    CLOSED: "bg-gray-100 text-gray-800",
  };

  const statusLabel = (status: string) => {
    if (status === "INPROGRESS" && helpRequest.isReopened) return "REOPENED";
    if (status === "INPROGRESS") return "IN PROGRESS";
    return status;
  };

  return (
    <div className="m-4 flex w-full max-w-6xl flex-col gap-6 md:flex-row items-stretch h-[calc(100vh-8rem)]">
      {/* Left/Middle Column - Chat */}
      <div className="flex-1 flex flex-col rounded-2xl border bg-card shadow-lg overflow-hidden">
        <div className="bg-muted p-4 border-b">
          <h2 className="text-lg font-bold">Chat with Guest</h2>
          <p className="text-sm text-muted-foreground">Support thread for request #{helpRequest.id.slice(-6)}</p>
        </div>
        <div className="flex-1 overflow-hidden p-4 bg-background flex flex-col">
          <AdminHelpChatBox requestId={helpRequest.id} currentUserId={currentUserId} isResolved={helpRequest.status === "RESOLVED"} />
        </div>
      </div>

      {/* Right Column - Details and Form */}
      <div className="flex w-full flex-col gap-4 md:w-[320px] shrink-0 overflow-y-auto pb-4 pr-1">
        <div className="bg-card flex flex-col rounded-2xl border p-4 shadow-lg">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-lg font-semibold">
              {helpRequest.createdAt &&
                format(new Date(helpRequest.createdAt), "dd MMM yyyy")}
            </h3>
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                statusColor[helpRequest.status] || "bg-gray-100 text-gray-800"
              }`}
            >
              <Info className="h-4 w-4" /> {statusLabel(helpRequest.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="divide-border bg-card flex flex-col divide-y overflow-hidden rounded-xl border shadow-sm">
              <div className="flex items-center gap-2 p-3">
                <UserRound className="size-4" />
                <div className="text-md flex-1 font-bold break-all">
                  {helpRequest.name}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2 px-3 py-1">
                <Phone className="size-4" />
                <div className="flex-1 text-sm break-all">
                  {helpRequest.phone}
                </div>
                <Button
                  size={"icon"}
                  variant={"ghost"}
                  onClick={() => copyToClipboard(helpRequest.phone, "phone")}
                  className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-zinc-700"
                  title="Copy Phone"
                >
                  {copiedField === "phone" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Email */}
              {helpRequest.email && (
                <div className="flex items-center gap-2 px-3 py-1">
                  <Mail className="size-4" />
                  <div className="flex-1 text-sm break-all text-gray-700 dark:text-gray-200">
                    {helpRequest.email}
                  </div>
                  <Button
                    size={"icon"}
                    variant={"ghost"}
                    onClick={() =>
                      copyToClipboard(helpRequest?.email || "", "email")
                    }
                    className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-zinc-700"
                    title="Copy Email"
                  >
                    {copiedField === "email" ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clipboard className="h-4 w-4" />
                    )}
                  </Button>
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
                <div className="flex-1 text-sm break-all">
                  {helpRequest.reason}
                </div>
              </div>

              {helpRequest.message && (
                <div className="flex items-start gap-2 text-sm">
                  <div
                    className={"text-muted-foreground flex items-center gap-2"}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium">Message:</span>
                  </div>
                  <p>{helpRequest.message}</p>
                </div>
              )}
            </div>

            {helpRequest.adminNote && (
              <div className="bg-muted mt-1 flex flex-col gap-2 rounded-xl border p-3 text-sm">
                <div className="flex items-start gap-3">
                  <Reply className="text-muted-foreground mt-1 h-4 w-4 shrink-0" />
                  <span className="text-muted-foreground font-medium text-nowrap">
                    Team Reply:
                  </span>
                  <p className="w-full text-sm font-bold">
                    {helpRequest.adminNote}
                  </p>
                </div>
              </div>
            )}

            {helpRequest.feedback && (
              <div className="bg-muted mt-1 flex flex-col gap-2 rounded-xl border p-3 text-sm">
                <div className="flex items-start gap-3">
                  <StarsIcon className="text-muted-foreground mt-1 h-4 w-4 shrink-0" />
                  <span className="text-muted-foreground font-medium text-nowrap">
                    User Feedback:
                  </span>
                  <p className="w-full text-sm font-bold">
                    {helpRequest.feedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card flex flex-col rounded-2xl border p-4 shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="PENDING">PENDING</SelectItem>
                        <SelectItem value="INPROGRESS">INPROGRESS</SelectItem>
                        <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isUpdating} className="w-full">
                {isUpdating ? (
                  <ButtonLoading text="Updating..." />
                ) : (
                  "Update Status"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

function AdminHelpChatBox({ requestId, currentUserId, isResolved }: { requestId: string, currentUserId: string, isResolved: boolean }) {
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
    refetchInterval: 5000, // Poll every 5s for team
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (content: string) => sendAdminHelpMessage(requestId, content),
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
            No messages yet. Send a reply to start the conversation!
          </p>
        ) : (
          messages.map((msg: IHelpRequestMessage, index: number) => {
            const isGuest = msg.senderType === "GUEST";
            const isMe = !isGuest && msg.senderId === currentUserId;
            const senderName = msg.teamSender
              ? `${addIdPrefix(msg.teamSender.internalId.toString(), msg.teamSender.role as any)}`
              : "Support";
            const isNewMessage = lastReadId && index > 0 && messages[index - 1].id === lastReadId;

            return (
              <Fragment key={msg.id}>
                {isNewMessage && (
                  <div ref={dividerRef} className="flex items-center justify-center my-4">
                    <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs border shadow-sm">
                      New Messages
                    </span>
                  </div>
                )}
                <div
                  className={`flex flex-col ${
                  isGuest ? "items-start" : "items-end"
                }`}
              >
                {!isGuest && (
                  <span className="text-[10px] text-muted-foreground mb-1 mr-1">
                    {isMe ? "You" : senderName}
                  </span>
                )}
                {isGuest && (
                  <span className="text-xs text-muted-foreground mb-1 ml-1">
                    Guest
                  </span>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm break-all ${
                    isGuest
                      ? "bg-muted text-foreground rounded-bl-none border"
                      : isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-emerald-600 text-white rounded-br-none shadow-sm"
                  }`}
                >
                  {msg.content === "This request has been marked as resolved. The chat is now closed." && !isGuest
                    ? `This request has been marked as resolved by ${senderName}. The chat is now closed.`
                    : msg.content}
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
        <div className="p-3 border-t bg-background text-center text-sm text-muted-foreground">
          This chat is closed because the request is resolved.
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="p-3 border-t bg-background flex gap-2">
          <input
            name="content"
            placeholder="Type a reply..."
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
