"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Gender } from "@/types/groom";
import LoadingPage from "@/components/loader";
import { useTeamMessages } from "@/components/useTeamMessages";
import { format, isToday, isYesterday } from "date-fns";
import { useChatUIStore } from "@/hooks/useChatUIStore";
import { Role } from "@/types/Role";
import { useTeamSANotificationStore } from "@/hooks/useTeamSANotificationStore";

export default function MessageManagerClientPage({
  userId,
  userRole,
}: {
  userId: string;
  userRole: Role;
}) {
  const {
    messages,
    sendMessage,
    isLoading,
    participants,
    startConversation,
    conversationId,
  } = useTeamMessages(userId);
  const router = useRouter();
  const [inputMessage, setInputMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const setActiveConversation = useChatUIStore((s) => s.setActiveConversation);
  const resetTeamHeadMessage = useTeamSANotificationStore(
    (s) => s.resetTeamHeadMessage
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log("set conv id", conversationId);

    // mark chat as open
    setActiveConversation(conversationId);
    resetTeamHeadMessage();
    return () => {
      setActiveConversation(null);
    };
  }, [conversationId, setActiveConversation, resetTeamHeadMessage]);

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

  return isLoading || !participants ? (
    <div className={"flex flex-1 items-center justify-center"}>
      <LoadingPage />
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
          <AvatarImage
            src={
              participants?.avatar
                ? participants?.avatar
                : participants?.gender === Gender.MALE
                  ? "/groom.webp"
                  : "/bride.webp"
            }
          />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <h1 className="flex items-center text-center text-lg font-semibold">
          {userRole === Role.GHOTOK
            ? "Team"
            : [
                participants?.firstName,
                participants?.middleName,
                participants?.lastName,
              ]
                .filter(Boolean)
                .join(" ")}
        </h1>
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
                        {/* {isOwn && getStatusIcon(message.status)} */}
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
