"use client";

import { getUserConversations } from "@/actions/conversations";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { useEffect, useMemo, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatHistoryClient({ convId }: { convId: string }) {
  const endRef = useRef<HTMLDivElement>(null);

  const {
    data: conversation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["getChatHistory", convId],
    queryFn: () => getUserConversations(convId),
  });

  const messages = conversation?.messages;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation?.messages.length]);

  const maleUser = conversation?.participants.find(
    (user) => user.gender === "MALE"
  );
  const femaleUser = conversation?.participants.find(
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

  return (
    <div className="flex flex-col">
      <div className="mx-auto flex h-[calc(100vh-40px)] w-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b bg-gradient-to-r from-blue-500 to-pink-500 p-4 text-white">
          <div className="flex items-center gap-2 overflow-hidden">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={"/groom.webp"} />
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <p className="truncate font-semibold">
              {maleUser?.title} {maleUser?.lastName}
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-hidden">
            <p className="truncate text-right font-semibold">
              {femaleUser?.title} {femaleUser?.lastName}
            </p>
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={"/bride.webp"} />
              <AvatarFallback>F</AvatarFallback>
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
                    const isMe = msg.senderId === femaleUser?.id;
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
