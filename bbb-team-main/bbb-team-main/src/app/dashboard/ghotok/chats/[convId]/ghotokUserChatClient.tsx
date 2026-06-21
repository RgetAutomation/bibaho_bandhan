"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Ban, Clock, Send, SmilePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useGhotokUserMessages } from "@/components/useGhotokUserMessages";
import { IGhotokUserConversationMessage } from "@/components/interface/ghotok/IGhotokUserConversation";
import { format, isToday, isYesterday } from "date-fns";
import {
  MessageDeliveredIcon,
  MessageReadIcon,
  MessageSendIcon,
} from "@/components/icons/message-status";
import Loading from "./loading";

export default function GhotokUserChatClient({
  convId,
  ghotokId,
}: {
  convId: string;
  ghotokId: string;
}) {
  const router = useRouter();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLInputElement>(null);

  // const { data, isLoading, error } = useQuery({
  //   queryKey: ["getAllGhotokUserChats"],
  //   queryFn: () => getGhotokUserConversationsDetails(convId),
  //   placeholderData: keepPreviousData,
  // });

  // const participants = data?.participants?.find((p) => p.ghotokId !== ghotokId);
  // const currentGhotokUser = data?.participants?.find(
  //   (t) => t.ghotokId === ghotokId
  // );
  const {
    isLoading,
    messages,
    myParticipant,
    participant,
    sendMessage,
    startConversation,
  } = useGhotokUserMessages(convId, ghotokId);

  useEffect(() => {
    startConversation();
  }, [startConversation]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col">
      <div
        className={
          "flex w-full items-center justify-between border-b border-zinc-100 dark:border-zinc-800"
        }
      >
        <div className="flex items-center gap-4 p-4">
          <Button
            onClick={() => router.back()}
            variant={"ghost"}
            className="h-8 w-8 rounded-full"
          >
            <ArrowLeft className="size-6" />
          </Button>
          <Link
            href={`/dashboard/ghotok/profile/public/${participant?.id}`}
            className="flex items-center gap-4 px-4"
          >
            <Avatar className="bg-card ring-offset-card h-12 w-12 border ring-1 ring-rose-400 ring-offset-2">
              <AvatarImage
                src={participant?.avatar ?? ""}
                alt="Avatar"
                width={50}
                height={50}
              />
              <AvatarFallback>
                {participant?.lastName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold">
                {participant?.title} {participant?.lastName}
              </h1>
              {/* <OnlineStatus
              userId={participants?.id || ""}
              typing={isReceiverTyping}
            /> */}
            </div>
          </Link>
        </div>
        <div className="flex items-center justify-center px-4">
          <Link href={`/dashboard/ghotok/profile/public/${myParticipant?.id}`}>
            <Avatar className="bg-card ring-offset-card h-12 w-12 border ring-1 ring-rose-400 ring-offset-2">
              <AvatarImage
                src={myParticipant?.avatar ?? ""}
                alt="Avatar"
                width={50}
                height={50}
              />
              <AvatarFallback>
                {myParticipant?.lastName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[65vh] overflow-y-auto">
        <MessageList
          messages={messages}
          currentUserId={myParticipant?.id || ""}
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col border-t p-4"
      >
        <div className="relative flex items-center gap-2">
          <Button
            type="button"
            variant={"outline"}
            size={"icon"}
            className="rounded-full"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <SmilePlus />
          </Button>
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-16 left-0 z-10"
            >
              <EmojiPicker
                onEmojiClick={(emoji) => {
                  setMessage((prev) => prev + emoji.emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}
          <Input
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={"Type a message..."}
            className="flex-1 rounded-full bg-zinc-100 px-4 py-2 outline-none dark:bg-zinc-800"
            maxLength={1000}
          />

          <Button
            type="submit"
            disabled={!message.trim()}
            className="bg-primary rounded-full text-white disabled:opacity-50"
            size={"icon"}
          >
            <Send />
          </Button>
        </div>

        {/* <div className="text-xs text-gray-500 mt-1 text-right">
        {message.length}/1000
      </div> */}
      </form>
    </div>
  );
}

type MessageListProps = {
  messages: IGhotokUserConversationMessage[];
  currentUserId: string;
};

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
          {msgs.map((message) => (
            <MessageBubble
              key={message.id}
              currentUserId={currentUserId}
              message={message}
            />
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

function MessageBubble({
  currentUserId,
  message,
}: {
  currentUserId: string;
  message: IGhotokUserConversationMessage;
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

  const isOwn = message.senderId === currentUserId;

  const hasModeration =
    message.moderation?.reason &&
    message.moderation?.status === "REJECTED" &&
    isOwn === true;

  return (
    <div className={`mb-4 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className="relative flex max-w-[70%] flex-col">
        {/* 🔥 If Moderated */}
        {hasModeration ? (
          <div
            className={`space-y-2 rounded-2xl rounded-br-none border border-red-500 bg-red-400/10 p-3`}
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
