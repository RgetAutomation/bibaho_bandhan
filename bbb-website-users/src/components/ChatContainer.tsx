"use client";

import { useAuthSession } from "@/hooks/useAuthSession";

import { useMessages } from "@/hooks/useMessages";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { MessageInput } from "./MessageInput";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { OnlineStatus } from "./OnlineStatus";
import { useEffect, useMemo, useRef } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import LoadingPage from "./loader";
import Link from "next/link";
import MobileHeader from "./dashboard/MobileHeader";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  MessageDeliveredIcon,
  MessageReadIcon,
  MessageSendIcon,
} from "./icons/message-status";
import { Ban, Clock } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { IMessage } from "./interface/IMessage";
import { useInfiniteMessages } from "./useInfiniteMessages";
import { AnimatePresence, motion } from "motion/react";
import { useSocket } from "./contexts/SocketContext";
import { MessageStatus } from "./enum/messageStatus";

interface ChatContainerProps {
  conversationId: string;
  currentUserId: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  conversationId,
  currentUserId,
}) => {
  const { sockets } = useSocket();
  const socket = sockets["/"];
  const teamUserSocket = sockets["/teamuser"];
  const { user } = useAuthSession();
  const isPendingVerification = user?.verificationStatus !== "APPROVED";

  const readSentRef = useRef<Set<string>>(new Set());

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteMessages(conversationId);
  const router = useRouter();

  const { removeConversation } = useNotificationStore();

  useEffect(() => {
    if (conversationId) {
      removeConversation(conversationId);
    }
  }, [conversationId, removeConversation]);

  const parentRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef(0);
  const firstMessageIdRef = useRef<string | null>(null);
  const isFirstLoadRef = useRef(true);

  const { sendMessage, participant } = useMessages(
    conversationId,
    currentUserId,
  );

  // 🔥 Flatten paginated messages
  const messages: IMessage[] = useMemo(() => {
    if (!data?.pages) return [];

    // pages: [page1, page2, page3]
    // API returns DESC → we reverse pages order, not messages order
    const ordered = data.pages
      .slice() // copy
      .reverse() // oldest page first
      .flatMap((page) => page.messages.slice().reverse()); // oldest → newest per page

    return ordered;
  }, [data]);

  const { startTyping, stopTyping, isReceiverTyping } = useTypingIndicator(
    participant?.id || "",
    conversationId,
  );

  // Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // average message height
    overscan: 10,
  });

  /* FETCH OLDER MESSAGES WHEN SCROLL TOP */
  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
        prevHeightRef.current = el.scrollHeight;
        fetchNextPage();
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    if (prevHeightRef.current) {
      const newHeight = el.scrollHeight;
      el.scrollTop = newHeight - prevHeightRef.current;
      prevHeightRef.current = 0;
    }
  }, [messages.length]);

  // useEffect(() => {
  //   if (!rowVirtualizer || messages.length === 0) return;

  //   const lastIndex = messages.length - 1;
  //   const prevLength = prevLengthRef.current;

  //   // 1️⃣ First load → jump instantly
  //   if (prevLength === 0) {
  //     rowVirtualizer.scrollToIndex(lastIndex, { align: "end" });
  //   }

  //   // 2️⃣ New message added → smooth scroll
  //   else if (messages.length > prevLength) {
  //     rowVirtualizer.scrollToIndex(lastIndex, {
  //       align: "end",
  //       behavior: "smooth",
  //     });
  //   }

  //   // 3️⃣ Older messages fetched → do nothing
  //   // handled by your height-preserving logic

  //   prevLengthRef.current = messages.length;
  // }, [messages.length, rowVirtualizer]);

  useEffect(() => {
    if (!rowVirtualizer || messages.length === 0) return;

    const firstMessageId = messages[0]?.id;
    const lastMessageIndex = messages.length - 1;

    const isFirstLoad = isFirstLoadRef.current;
    const olderMessagesLoaded =
      firstMessageIdRef.current && firstMessageId !== firstMessageIdRef.current;

    // ✅ First load → jump to bottom
    if (isFirstLoad) {
      rowVirtualizer.scrollToIndex(lastMessageIndex, { align: "end" });
      isFirstLoadRef.current = false;
    }

    // ❌ Older messages loaded → DO NOTHING
    else if (olderMessagesLoaded) {
      // preserve scroll position handled separately
    }

    // ✅ New message at bottom
    else {
      rowVirtualizer.scrollToIndex(lastMessageIndex, {
        align: "end",
        behavior: "smooth",
      });
    }

    firstMessageIdRef.current = firstMessageId;
  }, [messages, rowVirtualizer]);

  /* -------------------------------------------
     AUTO MARK AS READ (REALTIME)
  -------------------------------------------- */
  useEffect(() => {
    if (!socket || !participant?.id || !teamUserSocket) return;

    const unreadIds = messages
      .filter(
        (m) =>
          m.receiverId === currentUserId &&
          m.senderId === participant.id &&
          m.status !== MessageStatus.READ &&
          m.status !== MessageStatus.PENDING &&
          !m.id.startsWith("temp-") &&
          !readSentRef.current.has(m.id),
      )
      .map((m) => m.id);

    if (unreadIds.length === 0) return;

    unreadIds.forEach((id) => readSentRef.current.add(id));

    if (!participant.isGhotokOwned) {
      socket.emit("mark-as-read", {
        messageIds: unreadIds,
        conversationId,
        receiverId: participant.id,
      });
    } else {
      teamUserSocket.emit("ghotok-user-mark-as-read", {
        messageIds: unreadIds,
        conversationId,
      });
    }
  }, [
    messages,
    socket,
    teamUserSocket,
    participant,
    currentUserId,
    conversationId,
  ]);

  if (isLoading) {
    return <LoadingPage />;
  }
  const handleSendMessage = (content: string) => {
    sendMessage(content);
    stopTyping();
  };

  const handleInputChange = (value: string) => {
    if (value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden w-full fixed top-0 left-0 right-0 h-[100dvh] z-40 md:relative md:h-auto md:z-auto bg-white dark:bg-zinc-950">
      {/* Top bar */}
      <div
        className={
          "w-full flex items-center justify-between gap-2.5 md:gap-4 py-2.5 px-3 md:p-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0"
        }
      >
        <div className="flex items-center gap-2.5 md:gap-4 flex-1 min-w-0">
          <Button
            onClick={() => router.back()}
            variant={"ghost"}
            className="rounded-full w-8 h-8 p-0 shrink-0"
          >
            <ArrowLeft className="size-5 md:size-6" />
          </Button>
          <Avatar 
            onClick={() => {
              if (window.innerWidth < 768) {
                router.push(`/users/profile/${participant?.id}`);
              }
            }}
            className="h-9 w-9 md:h-12 md:w-12 bg-card border ring-1 ring-rose-400 ring-offset-2 ring-offset-card shrink-0 cursor-pointer md:cursor-default"
          >
            <AvatarImage
              src={participant?.avatar || ""}
              alt="Avatar"
              width={50}
              height={50}
            />
            <AvatarFallback>
              {participant?.lastName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0">
            <h1 className="text-base md:text-lg font-semibold truncate">
              {participant?.title} {participant?.lastName}
            </h1>
            {!participant?.isGhotokOwned && (
              <OnlineStatus
                userId={participant?.id || ""}
                typing={isReceiverTyping}
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <Button
            size={"sm"}
            asChild
            className={"rounded-full hidden md:inline-flex"}
            variant={"outline"}
          >
            <Link href={`/users/profile/${participant?.id}`}>Profile</Link>
          </Button>
          <MobileHeader hideLogo={true} className="flex md:hidden items-center z-40 bg-transparent border-none p-0" />
        </div>
      </div>

      {/* Scrollable Message Area */}
      <div ref={parentRef} className="flex-1 overflow-y-auto relative">
        <AnimatePresence>
          {isFetchingNextPage && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex items-center gap-2 justify-center py-2 bg-zinc-200 dark:bg-zinc-800 text-sm px-2 border shadow-md overflow-hidden"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* This wrapper is REQUIRED */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize() + 24}px`,
            position: "relative",
            width: "100%",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const message = messages[virtualRow.index];
            if (!message) return null;

            const prevMessage = messages[virtualRow.index - 1];

            const currentDate = new Date(message.createdAt);
            const prevDate = prevMessage
              ? new Date(prevMessage.createdAt)
              : null;

            const showDateSeparator =
              !prevDate ||
              currentDate.toDateString() !== prevDate.toDateString();

            const renderDateLabel = () => {
              if (isToday(currentDate)) return "Today";
              if (isYesterday(currentDate)) return "Yesterday";
              return format(currentDate, "dd/MM/yyyy");
            };

            return (
              <div
                key={message.id}
                ref={rowVirtualizer.measureElement}
                data-index={virtualRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  padding: "0 10px",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {showDateSeparator && (
                  <div className="flex w-full items-center justify-center py-2">
                    <span className="bg-zinc-200 dark:bg-zinc-800 text-sm px-2 py-1 rounded-full border shadow-md">
                      {renderDateLabel()}
                    </span>
                  </div>
                )}

                <MessageBubble
                  message={message}
                  currentUserId={currentUserId}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Input */}
      {isPendingVerification ? (
        <div className="p-4 bg-amber-50 border-t text-amber-700 text-center text-sm font-medium">
          You cannot send messages until your profile verification is approved.
        </div>
      ) : (
        <MessageInput
          onSendMessage={handleSendMessage}
          onInputChange={handleInputChange}
          disabled={!participant?.id}
        />
      )}
    </div>
  );
};

function MessageBubble({
  currentUserId,
  message,
}: {
  currentUserId: string;
  message: IMessage;
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
            className={`space-y-2 rounded-2xl border p-3 border-red-500 bg-red-400/10 rounded-br-none`}
          >
            {/* Message */}
            <div
              className={`px-4 py-2 rounded-lg border break-words shadow-sm opacity-80 ${
                isOwn
                  ? "border-primary bg-rose-500/10 dark:text-white text-black"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
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
              <Ban className="p-1 w-5 h-5 shrink-0" />
              <span className="ml-1">{message?.moderation?.reason}</span>
            </div>
          </div>
        ) : (
          /* ✅ Normal Message */
          <div
            className={`px-4 py-2 rounded-2xl break-words shadow-sm ${
              isOwn
                ? "bg-rose-500 text-white rounded-br-none"
                : "bg-[#82ed82] text-black rounded-bl-none"
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
