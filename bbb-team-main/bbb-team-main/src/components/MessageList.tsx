// components/MessageList.tsx
"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { format, isToday, isYesterday } from "date-fns";
// import {
//   MessageDeliveredIcon,
//   MessageReadIcon,
//   MessageSendIcon,
// } from "./icons/message-status";
// import { Clock } from "lucide-react";
import { IMessage } from "./interface/IMessage";

interface MessageListProps {
  messages: IMessage[];
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case "READ":
  //       return <MessageReadIcon className="ml-1 size-4 text-green-600" />;
  //     case "DELIVERED":
  //       return <MessageDeliveredIcon className="ml-1 size-4" />;
  //     case "SENT":
  //       return <MessageSendIcon className="ml-1 size-4" />;
  //     default:
  //       return <Clock className="ml-1 size-4" />;
  //   }
  // };

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

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date}>
          {renderDateSeparator(new Date(date))}
          {msgs.map((message) => {
            const isOwn = message.senderTeamId === currentUserId;

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
  );
};
