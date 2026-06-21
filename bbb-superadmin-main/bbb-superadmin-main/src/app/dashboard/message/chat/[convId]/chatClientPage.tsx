"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { UserGender } from "@/components/enum/userGender";
import { useTeamMessages } from "@/components/useTeamMessage";
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
import toast from "react-hot-toast";
import { deleteTeamSAMessageByConvId } from "@/action/teams";
import Link from "next/link";

export default function TeamChatClientPage({
  convId,
  userId,
}: {
  convId: string;
  userId: string;
}) {
  const {
    messages,
    sendMessage,
    isLoading,
    participants,
    // conversationId,
    startConversation,
  } = useTeamMessages(convId, userId);
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

  const handleDeleteMessages = async (conversationId: string) => {
    try {
      const response = await deleteTeamSAMessageByConvId(conversationId || "");

      if (response.success) {
        toast.success(response.message || "Conversation deleted successfully.");
      } else {
        toast.error(response.message || "Failed to delete conversation.");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return isLoading || !participants ? (
    <div className={"flex flex-1 items-center justify-center"}>
      <Loader />
    </div>
  ) : (
    <div className="flex h-[calc(100vh-80px)] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b">
        {/* Header */}
        <div className="item-center flex gap-3 p-3">
          <Button
            variant="ghost"
            size={"icon"}
            className="rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft />
          </Button>
          <Link
            href={`/dashboard/profile/team/${participants?.id}`}
            className="flex gap-2"
          >
            <Avatar className="size-10">
              <AvatarImage
                src={
                  participants?.avatar
                    ? participants?.avatar
                    : participants?.gender === UserGender.MALE
                      ? "/groom.webp"
                      : "/bride.webp"
                }
              />
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <h1 className="flex items-center text-center text-lg font-semibold">
              {participants?.firstName} {participants?.middleName}{" "}
              {participants?.lastName}
            </h1>
          </Link>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive/10 me-3 border-2"
              variant={"outline"}
            >
              <Trash2 size={16} />
              Delete Chats
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete
                messages from servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteMessages(convId)}>
                Yes, Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Messages */}
      <div className={"flex-1 overflow-y-auto"}>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {renderDateSeparator(new Date(date))}
              {msgs.map((message) => {
                const isOwn = message.senderTeamId === userId;

                return (
                  <div
                    key={message.id}
                    className={`mb-3 flex ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="relative flex max-w-[70%] flex-col">
                      <div
                        className={`rounded-2xl px-4 py-2 break-words shadow-sm ${
                          isOwn
                            ? "rounded-br-none bg-rose-500 text-white"
                            : "rounded-bl-none bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                        }`}
                      >
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
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section */}
      <div className="flex w-full items-center justify-center gap-2 border-t p-5">
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
          disabled={!inputMessage.trim()}
          onClick={handleSendMessage}
        >
          <Send />
        </Button>
      </div>
    </div>
  );
}
