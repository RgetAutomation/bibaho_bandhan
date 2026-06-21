"use client";

import BackHeaderComponent from "@/components/backHeaderComponent";
import {
  IConversation,
  IConversationMessages,
} from "@/components/interface/IConversation";
import {
  MessageDeliveredIcon,
  MessageReadIcon,
  MessageSendIcon,
} from "@/components/resource/image/icons/message-status";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isToday, isYesterday } from "date-fns";
import { Ban, Clock } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteConversationChatById } from "@/action/conversation";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ChatsHistoryClient({
  conversation,
}: {
  conversation: IConversation;
}) {
  const router = useRouter();
  const endRef = useRef<HTMLDivElement>(null);
  const messages = conversation.messages;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation.messages.length]);

  const maleUser = conversation.participants.find(
    (user) => user.gender === "MALE"
  );
  const femaleUser = conversation.participants.find(
    (user) => user.gender === "FEMALE"
  );

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

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const response = await deleteConversationChatById(conversationId);

      if (response.success) {
        router.refresh();
        toast.success(response.message || "Conversation deleted successfully.");
      } else {
        toast.error(response.message || "Failed to delete conversation.");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex flex-col">
      <div className={"flex items-center justify-between"}>
        <BackHeaderComponent title="Chat History" />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="me-3">Delete Chats</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                conversation from servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteConversation(conversation.id)}
              >
                Yes, Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="mx-auto flex h-[calc(100vh-40px)] w-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b bg-gradient-to-r from-blue-500 to-pink-500 p-4 text-white">
          <Link href={`/dashboard/profile/user/${maleUser?.id}`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={maleUser?.avatar || "/groom.webp"} />
                <AvatarFallback>
                  {maleUser?.firstName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="truncate font-semibold">
                {maleUser?.firstName} {maleUser?.middleName ?? ""}{" "}
                {maleUser?.lastName}
              </p>
            </div>
          </Link>

          <Link href={`/dashboard/profile/user/${femaleUser?.id}`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <p className="truncate text-right font-semibold">
                {femaleUser?.firstName} {femaleUser?.middleName ?? ""}{" "}
                {femaleUser?.lastName}
              </p>
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={femaleUser?.avatar || "/bride.webp"} />
                <AvatarFallback>
                  {femaleUser?.firstName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </Link>
        </div>

        {/* Messages */}
        <div className="min-h-0 w-full flex-1 rounded-b-xl bg-zinc-100 dark:bg-zinc-800">
          <ScrollArea className="h-full">
            <div id="chat-scroll" className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="mt-8 text-center text-zinc-500">
                  No messages — say hi 👋
                </div>
              )}

              {Object.entries(groupedMessages).map(([date, messages]) => (
                <div key={date}>
                  {renderDateSeparator(new Date(date))}
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      femaleUserId={femaleUser?.id || ""}
                      message={msg}
                    />
                  ))}
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  femaleUserId,
  message,
}: {
  femaleUserId: string;
  message: IConversationMessages;
}) {
  const getStatusIcon = (status: string) => {
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

  const isOwn = message.senderId === femaleUserId;

  const hasModeration =
    message.moderation?.reason && message.moderation?.status === "REJECTED";

  return (
    <div className={`mb-4 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className="relative flex max-w-[70%] flex-col">
        {/* 🔥 If Moderated */}
        {hasModeration ? (
          <div
            className={`space-y-2 rounded-2xl border border-red-500 bg-red-400/10 p-3`}
          >
            {/* Message */}
            <div
              className={`rounded-lg border px-4 py-2 break-words opacity-80 shadow-sm ${
                isOwn
                  ? "border-primary bg-rose-500/10 text-black dark:text-white"
                  : "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              {message.content}
            </div>

            {/* Reason */}
            <div
              className={`flex items-start text-xs font-medium ${
                isOwn ? "text-red-500" : "text-yellow-700 dark:text-yellow-400"
              }`}
            >
              <Ban className="h-5 w-5 shrink-0 p-1" />
              <span className="ml-1">{message?.moderation?.reason}</span>
            </div>
          </div>
        ) : (
          /* ✅ Normal Message */
          <div
            className={`rounded-2xl px-4 py-2 break-words shadow-sm ${
              isOwn
                ? "rounded-br-none bg-rose-500 text-white"
                : "rounded-bl-none bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            }`}
          >
            {message.content}
          </div>
        )}

        {/* Time & Status */}
        <div
          className={`mt-1 flex gap-1 text-[10px] ${
            isOwn ? "justify-end text-rose-700" : "justify-start text-zinc-600"
          }`}
        >
          {format(new Date(message.createdAt), "hh:mm a")}
          {isOwn && getStatusIcon(message.status)}
        </div>
      </div>
    </div>
  );
}
