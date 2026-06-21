"use client";

import BackHeaderComponent from "@/components/backHeaderComponent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isToday, isYesterday } from "date-fns";
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
import toast from "react-hot-toast";
import { deleteAdminModeratorMessageConversationById } from "@/action/conversation";
import { Button } from "@/components/ui/button";
import { IAdminModeratorConversationMessages } from "@/components/interface/IAdminModeratorChats";
import { useRouter } from "next/navigation";

export default function AdminModeratorChatClient({
  conversationId,
  conversation,
}: {
  conversationId: string;
  conversation: IAdminModeratorConversationMessages | null;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const messages = conversation?.messages;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation?.messages.length]);

  const maleUser = conversation?.participants[0];
  const teamUser = conversation?.participants[1];

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

  if (!conversation) return null;

  const handleDeleteConversation = async (conversationId: string) => {
    setIsDeleting(true);
    try {
      const response = await deleteAdminModeratorMessageConversationById(
        conversationId || ""
      );

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
    setIsDeleting(false);
  };

  return (
    <div className="flex flex-col">
      <div className={"flex items-center justify-between"}>
        <BackHeaderComponent title="Chat History" />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="me-3" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Conversation"}
            </Button>
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
                onClick={() => handleDeleteConversation(conversationId)}
              >
                Yes, Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="mx-auto flex h-[calc(100vh-40px)] w-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b p-4">
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

          <div className="flex items-center gap-2 overflow-hidden">
            <p className="truncate text-right font-semibold">
              {teamUser?.firstName} {teamUser?.middleName ?? ""}{" "}
              {teamUser?.lastName}
            </p>
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={teamUser?.avatar || "/bride.webp"} />
              <AvatarFallback>
                {teamUser?.firstName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Messages */}
        <div className="min-h-0 w-full flex-1 rounded-b-xl bg-zinc-100 dark:bg-zinc-800">
          <ScrollArea className="h-full">
            <div id="chat-scroll" className="flex-1 overflow-y-auto p-4">
              {messages?.length === 0 && (
                <div className="mt-8 text-center text-zinc-500">
                  No messages — say hi 👋
                </div>
              )}

              {Object.entries(groupedMessages).map(([date, messages]) => (
                <div key={date}>
                  {renderDateSeparator(new Date(date))}
                  {messages.map((msg) => {
                    const isMe = msg.senderTeamId === teamUser?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`mb-3 flex ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div className="relative flex max-w-[80%] flex-col sm:max-w-[70%]">
                          <div
                            className={`px-4 py-2 text-sm break-words shadow-sm md:text-base ${
                              isMe
                                ? "rounded-2xl rounded-br-sm bg-rose-500 text-white"
                                : "rounded-2xl rounded-bl-sm bg-blue-500 text-white"
                            }`}
                          >
                            {msg.content}
                          </div>

                          <div
                            className={`mt-1 text-[10px] ${
                              isMe
                                ? "text-right text-rose-600"
                                : "text-left text-blue-600 dark:text-blue-200"
                            } `}
                          >
                            {format(msg.createdAt, "hh:mm a")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
