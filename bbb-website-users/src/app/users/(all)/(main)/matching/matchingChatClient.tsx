// components/ChatContainer.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  IndianRupee,
  Send,
  ShieldEllipsis,
  Wallet,
  XCircle,
  MailOpen,
  Hourglass,
  Info,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import {
//   MessageDeliveredIcon,
//   MessageReadIcon,
//   MessageSendIcon,
// } from "@/components/icons/message-status";
import { format, isToday, isYesterday } from "date-fns";
import LoadingPage from "@/components/loader";
import { useSAUserMessages } from "@/components/useSAUserMessages";
import { Badge } from "@/components/ui/badge";
import { ISAUserMessage } from "@/components/interface/ISAUserChat";
import SubmitLoadingView from "@/components/submitLoadingView";
import toast from "react-hot-toast";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/components/interface/AxiosResponse";

interface ChatContainerProps {
  currentUserId: string;
}

export const MatchingChatClient: React.FC<ChatContainerProps> = ({
  currentUserId,
}) => {
  const router = useRouter();

  const [input, setInput] = useState<string>("");
  const [activeGroupId, setActiveGroupId] = useState<string>("general");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<string>("all");
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, isLoading, startConversation, rejectPayment } =
    useSAUserMessages(currentUserId);

  //   const { startTyping, stopTyping, isReceiverTyping } = useTypingIndicator(
  //     participants?.id || "",
  //     conversationId
  //   );

  useEffect(() => {
    startConversation();
  }, [startConversation]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeGroupId]);

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

  type MatchGroup = {
    id: string; // The message id of the PROFILE message, or "general"
    profile?: { publicId: string; userName: string; avatar: string };
    messages: ISAUserMessage[];
    lastMessageAt: Date;
    status: string;
  };

  const matchGroups = useMemo(() => {
    if (!messages || messages.length === 0) return [];
    
    const groupsMap = new Map<string, MatchGroup>();
    let currentGroupId: string | null = null;

    messages.forEach((msg) => {
      const matchPrefixMatch = msg.content.match(/^\[Match:\s*([a-zA-Z0-9_-]+)\]:\s*/i);
      let messageGroupId = currentGroupId;

      if (matchPrefixMatch) {
         messageGroupId = matchPrefixMatch[1];
      }

      if (msg.type === "PROFILE") {
        const [publicId, userName, avatar] = (msg.content || "").split(";");
        messageGroupId = publicId;
        
        if (!groupsMap.has(publicId)) {
          groupsMap.set(publicId, {
            id: publicId,
            profile: { publicId, userName, avatar },
            messages: [],
            lastMessageAt: new Date(msg.createdAt),
            status: "Under Discussion"
          });
        }
        
        const group = groupsMap.get(publicId)!;
        group.messages.push(msg);
        group.lastMessageAt = new Date(msg.createdAt);
        currentGroupId = publicId;
      } else {
        if (messageGroupId) {
          if (!groupsMap.has(messageGroupId)) {
            groupsMap.set(messageGroupId, {
              id: messageGroupId,
              profile: { publicId: messageGroupId, userName: `Match ${messageGroupId}`, avatar: "" },
              messages: [],
              lastMessageAt: new Date(msg.createdAt),
              status: "Under Discussion"
            });
          }
          const group = groupsMap.get(messageGroupId)!;
          group.messages.push(msg);
          group.lastMessageAt = new Date(msg.createdAt);
          if (msg.type === "PAYMENT") {
              group.status = `Payment ${msg.paymentPhase || "Pending"}`;
          }
          currentGroupId = messageGroupId;
        }
      }
    });

    // Sort by lastMessageAt descending
    const allGroups = Array.from(groupsMap.values());
    const validGroups = allGroups.filter(g => g.messages.length > 0);
    
    return validGroups.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }, [messages]);

  const filteredMatchGroups = useMemo(() => {
    if (filterMode === "all") return matchGroups;
    if (filterMode === "unread") {
      return matchGroups.filter(group => {
        return group.messages.some(msg => 
          msg.senderId !== currentUserId && 
          msg.status !== "READ"
        );
      });
    }
    return matchGroups;
  }, [matchGroups, filterMode, currentUserId]);

  const unreadCount = useMemo(() => {
    return matchGroups.filter(group => {
      return group.messages.some(msg => 
        msg.senderId !== currentUserId && 
        msg.status !== "READ"
      );
    }).length;
  }, [matchGroups, currentUserId]);

  // Set default active group on load if none selected
  useEffect(() => {
    if (matchGroups.length > 0 && activeGroupId === "general") {
      setActiveGroupId(matchGroups[0].id);
    }
  }, [matchGroups, activeGroupId]);

  const activeGroup = matchGroups.find(g => g.id === activeGroupId);

  const groupedMessages = useMemo(() => {
    const msgs = activeGroup?.messages || [];
    if (!msgs || msgs.length === 0) return {};
    return msgs.reduce<Record<string, typeof msgs>>((acc, msg) => {
      const d = new Date(msg.createdAt).toISOString().split("T")[0]; // "YYYY-MM-DD"
      if (!acc[d]) acc[d] = [];
      acc[d].push(msg);
      return acc;
    }, {});
  }, [activeGroup]);

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
      <div className="w-full flex items-center justify-center gap-2 py-2">
        <span className="bg-zinc-200 dark:bg-zinc-800 text-sm px-2 py-1 rounded-full border shadow-md">
          {dateString}
        </span>
      </div>
    );
  };

  //   if (isLoading) {
  //     return <LoadingPage />;
  //   }
  //   const handleSendMessage = (content: string) => {
  //     sendMessage(content);
  //     stopTyping();
  //   };

  //   const handleInputChange = (value: string) => {
  //     if (value.trim()) {
  //       startTyping();
  //     } else {
  //       stopTyping();
  //     }
  //   };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (input.trim()) {
      let finalInput = input;
      // Prepend the bride reference if we are in a specific match group
      if (activeGroup?.profile?.publicId) {
          finalInput = `[Match: ${activeGroup.profile.publicId}]: ${input}`;
      }
      sendMessage(finalInput);
      setInput("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (!matchGroups || matchGroups.length === 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center h-full w-full bg-white dark:bg-zinc-950 p-6 text-center">
        <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-full mb-6 shadow-sm border border-rose-100 dark:border-rose-900/30">
          <MailOpen className="w-12 h-12 text-[#E51E44] opacity-90" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-3">No Match Notices Yet</h2>
        <p className="text-slate-500 dark:text-zinc-400 max-w-md mx-auto text-[14px] leading-relaxed">
          You currently don't have any active Match Notices. Once our team proposes a match for you, all communications, profiles, and updates regarding that match will appear securely right here!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden w-full">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? "w-72" : "w-[80px]"} border-r border-zinc-100 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-950 hidden md:flex shrink-0 transition-all duration-300`}>
        {isSidebarOpen ? (
          <>
            <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold flex items-center gap-1.5"><MailOpen className="w-4 h-4 text-rose-500" /> Match Notices</h2>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="bg-[#E51E44] text-white p-1.5 rounded-xl shadow-md shadow-[#E51E44]/20 hover:bg-[#C81A3C] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
            </div>
            <div className="px-3 pb-2 pt-2 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button 
                  onClick={() => setFilterMode("all")}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[11px] font-bold transition-colors ${filterMode === "all" ? "border-[#E51E44]/30 bg-rose-50 dark:bg-[#E51E44]/10 text-[#E51E44]" : "border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300"}`}
                >
                  All Chats
                </button>
                <button 
                  onClick={() => setFilterMode("unread")}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 transition-colors ${filterMode === "unread" ? "border-[#E51E44]/30 bg-rose-50 dark:bg-[#E51E44]/10 text-[#E51E44]" : "border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300"}`}
                >
                  Unread
                  {unreadCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${filterMode === "unread" ? "bg-[#E51E44] text-white" : "bg-rose-100 dark:bg-rose-900/40 text-[#E51E44]"}`}>{unreadCount}</span>
                  )}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                {filteredMatchGroups?.map((group) => (
                    <div 
                        key={group.id} 
                        onClick={() => setActiveGroupId(group.id)}
                        className={`p-3 rounded-xl cursor-pointer border transition-all ${activeGroupId === group.id ? 'border-rose-400 bg-rose-50 shadow-sm dark:bg-rose-950/40' : 'border-zinc-100 bg-white hover:border-rose-200 dark:border-zinc-800 dark:bg-zinc-900'}`}
                    >
                        <div className="flex items-center gap-2.5 mb-1.5">
                            <Avatar className="w-9 h-9 border ring-1 ring-rose-100 shrink-0">
                                <AvatarImage src={group.profile?.avatar || "/bride.webp"} className="object-cover" />
                                <AvatarFallback>{group.profile?.userName?.charAt(0) || "B"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[13px] truncate text-gray-900 dark:text-white leading-tight">{group.profile?.userName}</h3>
                                <p className="text-[11px] font-semibold text-muted-foreground truncate leading-tight mt-0.5">ID: {group.profile?.publicId}</p>
                            </div>
                            {activeGroupId === group.id && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 ml-1" />}
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                                {group.status.includes("Payment") ? <CreditCard className="w-3 h-3 text-orange-500"/> : <CheckCircle2 className="w-3 h-3 text-green-500"/>}
                                <span className="truncate max-w-[120px]">{group.status}</span>
                            </div>
                            <span className="text-[9px] font-semibold text-zinc-400 shrink-0 ml-1">{format(group.lastMessageAt, "dd MMM")}</span>
                        </div>
                    </div>
                ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-5 h-full w-full gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="bg-[#E51E44] text-white p-2 rounded-xl shadow-md shadow-[#E51E44]/20 hover:bg-[#C81A3C] transition-colors flex items-center justify-center w-10 h-10 shrink-0 mb-2"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="flex-1 overflow-y-auto w-full flex flex-col items-center gap-4 scrollbar-hide px-2 pb-4 pt-2">
              {filteredMatchGroups?.map((group) => (
                <div 
                  key={group.id} 
                  onClick={() => setActiveGroupId(group.id)}
                  className={`relative w-[52px] h-[52px] cursor-pointer transition-all hover:scale-105 shrink-0 flex items-center justify-center rounded-full ${activeGroupId === group.id ? 'bg-rose-100 dark:bg-[#E51E44]/20 p-0.5' : ''}`}
                  title={group.profile?.userName}
                >
                  <Avatar className={`w-full h-full border-2 ${activeGroupId === group.id ? 'border-[#E51E44] shadow-md' : 'border-gray-200 dark:border-zinc-700'} shrink-0`}>
                      <AvatarImage src={group.profile?.avatar || "/bride.webp"} className="object-cover" />
                      <AvatarFallback>{group.profile?.userName?.charAt(0) || "B"}</AvatarFallback>
                  </Avatar>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Chat Area */}
      <div className="flex flex-col flex-1 min-w-0 bg-zinc-50/30 dark:bg-zinc-900/50">
        {/* Top bar */}
        <div className="flex items-center gap-4 p-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <Button
          onClick={() => router.back()}
          variant={"ghost"}
          className="rounded-full w-8 h-8"
        >
          <ArrowLeft className="size-6" />
        </Button>
        <Avatar className="h-12 w-12 bg-card border ring-1 ring-rose-400 ring-offset-2 ring-offset-card">
          <AvatarImage
            src={"/groom.webp"}
            alt="Avatar"
            width={50}
            height={50}
          />
          <AvatarFallback>SA</AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">{activeGroup ? activeGroup.profile?.userName : "Match Notice"}</h1>
          {/*<OnlineStatus
            userId={participants?.id || ""}
            typing={isReceiverTyping}
          />*/}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {renderDateSeparator(new Date(date))}
              {msgs.map((message) =>
                message.type === "PAYMENT" ? (
                  <PaymentBubble
                    key={message.id}
                    currentUserId={currentUserId}
                    message={message}
                    onReject={() => rejectPayment(message.id)}
                    onPay={() => router.push(`/users/matching/${message.id}`)}
                    onView={() =>
                      router.push(`/users/matching/success/${message.id}`)
                    }
                  />
                ) : message.type === "PROFILE" ? (
                  <ProfileBubble
                    key={message.id}
                    id={message.id}
                    content={message.content}
                    isOwn={message.senderId === currentUserId}
                    createdAt={message.createdAt}
                  />
                ) : message.content.includes("MATCH_CONFIRMATION_POLL") ? (
                  (() => {
                    const answerMsg = messages.find(m => 
                      new Date(m.createdAt).getTime() > new Date(message.createdAt).getTime() && 
                      (m.content.includes("Yes, Match Is Final") || 
                       m.content.includes("No, Still Under Discussion") || 
                       m.content.includes("Need More Time:"))
                    );
                    let answeredWith = null;
                    if (answerMsg) {
                      if (answerMsg.content.includes("Yes, Match Is Final")) answeredWith = "Yes, Match Is Final";
                      else if (answerMsg.content.includes("No, Still Under Discussion")) answeredWith = "No, Still Under Discussion";
                      else {
                        const match = answerMsg.content.match(/Need More Time: .* Days/);
                        if (match) answeredWith = match[0];
                      }
                    }

                    return (
                      <PollBubble 
                        key={message.id} 
                        currentUserId={currentUserId} 
                        message={message} 
                        answeredWith={answeredWith}
                        onRespond={(text) => {
                          let finalInput = text;
                          if (activeGroup?.profile?.publicId) {
                              finalInput = `[Match: ${activeGroup.profile.publicId}]: ${text}`;
                          }
                          sendMessage(finalInput);
                        }} 
                      />
                    );
                  })()
                ) : (message.content.includes("Yes, Match Is Final") || 
                     message.content.includes("No, Still Under Discussion") || 
                     message.content.includes("Need More Time:")) ? null : (
                  <MessageBubble
                    key={message.id}
                    currentUserId={currentUserId}
                    message={message}
                  />
                )
              )}
            </div>
          ))}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col p-4 border-t"
      >
        <div className="flex gap-2 items-center relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"Type a message..."}
            className="flex-1 rounded-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 outline-none"
            maxLength={1000}
          />

          <Button
            type="submit"
            disabled={!input.trim()}
            className="rounded-full bg-primary text-white disabled:opacity-50"
            size={"icon"}
          >
            <Send />
          </Button>
        </div>
      </form>
      </div>

      {/* Right Sidebar - Current Status */}
      <div className="hidden xl:flex flex-col w-[240px] shrink-0 p-3 space-y-3 h-full overflow-y-auto bg-white dark:bg-zinc-950 border-l border-zinc-100 dark:border-zinc-800 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {activeGroup ? (
          <div className="p-3 shrink-0 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-xl shadow-xs flex flex-col w-full">
            <h2 className="text-[12px] font-extrabold text-slate-800 dark:text-white mb-3">Current Status</h2>
            
            <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg mb-4 border border-orange-100 dark:border-orange-900/30">
              <div className="bg-orange-100 dark:bg-orange-900/50 p-1 rounded-full shrink-0">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-orange-600 dark:text-orange-400 font-bold text-[11px] leading-tight mb-0.5 truncate">Under Discussion</span>
                <span className="text-zinc-500 dark:text-zinc-400 text-[8px] font-semibold leading-tight truncate">Next Follow-up: 28 Jun 2026</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 text-[10px] font-semibold text-slate-700 dark:text-zinc-300">
              <div className="flex items-start justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Match ID</span>
                <span className="truncate text-slate-900 dark:text-zinc-100 font-bold text-right">{activeGroup.profile?.publicId || "MS-2026-00125"}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Discussion Ref</span>
                <span className="truncate text-slate-900 dark:text-zinc-100 font-bold text-right">DISC-00982</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Started On</span>
                <span className="truncate text-slate-900 dark:text-zinc-100 font-bold text-right">{activeGroup.lastMessageAt ? format(new Date(activeGroup.lastMessageAt), "dd MMM yy") : "12 Jun 26"}</span>
              </div>
              <div className="flex flex-col gap-1 border-t border-gray-100 dark:border-zinc-800 pt-2 mt-0.5">
                <span className="text-slate-500 dark:text-zinc-400">Match Type</span>
                <span className="text-slate-900 dark:text-zinc-100 font-bold leading-snug">Direct Groom ↔ Matchmaker Bride</span>
              </div>
            </div>
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400">
              <Info className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-xs font-semibold">Select a match to view details</p>
           </div>
        )}
      </div>
    </div>
  );
};

export function MessageBubble({
  currentUserId,
  message,
}: {
  currentUserId: string;
  message: ISAUserMessage;
}) {
  const isOwn = message.senderId === currentUserId;
  // Strip out the [Match: ID]: prefix if it exists so the user doesn't see it
  const displayContent = message.content.replace(/^\[Match:\s*[a-zA-Z0-9_-]+\]:\s*/i, '');

  return (
    <div className={`mb-3 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className="relative flex max-w-[70%] flex-col">
        <div
          className={`rounded-2xl px-4 py-2 break-words shadow-sm ${
            isOwn
              ? "rounded-br-none bg-rose-500 text-white"
              : "rounded-bl-none bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
          }`}
        >
          {displayContent}
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
}

type StatusConfig = {
  [key: string]: {
    label: string;
    color: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  };
};

const statusConfig: StatusConfig = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  VERIFYING: {
    label: "Verifying",
    color: "bg-yellow-100 text-yellow-700",
    icon: ShieldEllipsis,
  },
  APPROVED: {
    label: "Paid",
    color: "bg-green-100 text-green-700",
    icon: Wallet,
  },
  DECLINED: {
    label: "Declined",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

export function PaymentBubble({
  currentUserId,
  message,
  onReject,
  onPay,
  onView,
}: {
  currentUserId: string;
  message: ISAUserMessage;
  onReject?: () => void;
  onPay?: () => void;
  onView?: () => void;
}) {
  const isOwn = message.senderId === currentUserId;
  const status = message.paymentPhase || "PENDING";
  const StatusIcon = statusConfig[status].icon;

  return (
    <div className={`mb-3 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] min-w-2xs overflow-hidden rounded-2xl border shadow-sm ${
          isOwn
            ? "border-rose-400 bg-rose-50 dark:bg-rose-950/40"
            : "border-zinc-300 bg-white dark:bg-zinc-900 dark:border-primary/50"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b px-4 py-2 text-sm font-medium">
          <CreditCard className="h-4 w-4 text-rose-500" />
          <span>Payment Request</span>
        </div>

        {/* Body */}
        <div className="w-full space-y-2 px-4 py-3">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-2xl font-semibold">
              <IndianRupee className="h-5 w-5" />
              {message.price}
            </div>

            <Badge
              className={`flex items-center gap-1 rounded-full text-xs ${statusConfig[status].color}`}
            >
              <StatusIcon className="h-3 w-3" />
              {statusConfig[status].label}
            </Badge>
          </div>

          {message.content && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {message.content}
            </p>
          )}
        </div>

        {/* Actions */}
        {status === "PENDING" && !isOwn && (
          <div className="flex gap-2 border-t px-4 py-3">
            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              onClick={onReject}
            >
              <XCircle className="h-4 w-4" /> Decline
            </Button>
            <Button className="flex-1" size="sm" onClick={onPay}>
              <CheckCircle2 className="h-4 w-4" /> Pay
            </Button>
          </div>
        )}

        {(status === "APPROVED" ||
          status === "VERIFYING" ||
          status === "REJECTED") &&
          !isOwn && (
            <div className="border-t px-4 py-3">
              <Button className="w-full" size="sm" onClick={onView}>
                View
              </Button>
            </div>
          )}

        {/* Footer */}
        <div className="flex items-center justify-end border-t px-4 py-2 text-[10px] text-zinc-500">
          {format(new Date(message.createdAt), "hh:mm a")}
          {/* {isOwn && getStatusIcon(message.status)} */}
        </div>
      </div>
    </div>
  );
}

export function ProfileBubble({
  id,
  content,
  isOwn,
  createdAt,
}: {
  id: string;
  content: string;
  isOwn: boolean;
  createdAt: Date;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [publicId, userName, avatar] = content.split(";");

  const handleViewProfile = async () => {
    try {
      setLoadingId(id);
      const response = await api.get<AxiosResponse<{ userId: string }>>(
        `/users/bride/publicId/${publicId}`,
      );

      if (response.data.success) {
        const userId = response.data.data;
        if (userId) {
          router.push(`/users/profile/${userId}`);
        } else {
          toast.error("Failed to get user details");
        }
      }
    } catch (error) {
      setLoadingId(null);
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={`mb-4 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative flex max-w-[75%] min-w-2xs overflow-hidden rounded-2xl border shadow-sm ${
          isOwn
            ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-950/40"
            : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        } `}
      >
        {/* Accent strip */}
        <div className="w-1 bg-gradient-to-b from-rose-500 to-pink-500" />

        <div className="flex w-full flex-col">
          <div className="flex gap-4 p-4">
            {/* Avatar */}
            <Avatar className="size-16 shrink-0 ring-2 ring-rose-400/40">
              <AvatarImage src={avatar || ""} />
              <AvatarFallback className="bg-rose-500 text-lg font-semibold text-white">
                {userName?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex min-w-0 flex-col justify-center gap-1">
              <h2 className="truncate text-lg font-semibold">{userName}</h2>

              <p className="text-muted-foreground text-sm">
                Profile ID:
                <span className="ml-1 font-medium">{publicId}</span>
              </p>

              {/* CTA */}
              <Button
                variant="ghost"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-rose-600 dark:text-rose-400"
                onClick={handleViewProfile}
                disabled={loadingId === id}
              >
                {loadingId === id ? (
                  <SubmitLoadingView text="Please wait" />
                ) : (
                  <>
                    View profile
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-end border-t px-4 py-2 text-[10px] text-zinc-500">
            {format(new Date(createdAt), "hh:mm a")}
            {/* {isOwn && getStatusIcon(status)} */}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PollBubble({ currentUserId, message, answeredWith, onRespond }: { currentUserId: string, message: ISAUserMessage, answeredWith?: string | null, onRespond?: (text: string) => void }) {
  const isOwn = message.senderId === currentUserId;
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [customTime, setCustomTime] = useState<string>("");

  if (answeredWith) {
    let colorClass = "";
    let icon = null;
    let title = null;
    let subtitle = "";

    if (answeredWith === "Yes, Match Is Final") {
      colorClass = "bg-gradient-to-b from-green-500 to-emerald-500";
      icon = <CheckCircle2 className="w-5 h-5 text-green-600"/>;
      title = <span className="text-green-600">Yes, Match Is Final</span>;
      subtitle = "I confirm that this match has reached a final agreement.";
    } else if (answeredWith === "No, Still Under Discussion") {
      colorClass = "bg-gradient-to-b from-rose-500 to-pink-500";
      icon = <XCircle className="w-5 h-5 text-rose-600"/>;
      title = <span className="text-rose-600">No, Still Under Discussion</span>;
      subtitle = "We are still discussing and not final yet.";
    } else {
      colorClass = "bg-gradient-to-b from-orange-500 to-amber-500";
      icon = <Hourglass className="w-5 h-5 text-orange-600"/>;
      title = <span className="text-orange-600">{answeredWith}</span>;
      subtitle = "An extension has been requested.";
    }

    return (
      <div className={`mb-4 flex ${isOwn ? "justify-end" : "justify-start"}`}>
        <div className="relative flex max-w-[60%] min-w-[220px] overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          {/* Accent strip */}
          <div className={`w-1 shrink-0 ${colorClass}`} />
          
          <div className="flex w-full flex-col">
            <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center">
              <h4 className="font-bold flex items-center justify-center gap-1.5 text-base">
                {icon}
                {title}
              </h4>
              <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mt-0.5">{subtitle}</p>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end border-t border-zinc-100 dark:border-zinc-800 px-3 py-1.5 text-[10px] text-zinc-500">
              {format(new Date(message.createdAt), "hh:mm a")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-3 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col md:flex-row gap-3 w-full max-w-2xl bg-white dark:bg-zinc-900 p-4 rounded-xl border shadow-sm">
        
        {/* Need More Time Card */}
        <div className="flex-1 p-3 border border-orange-200 bg-orange-50 dark:bg-orange-950/30 rounded-lg flex flex-col gap-2">
          <h4 className="font-bold text-orange-600 flex items-center justify-center gap-1"><Hourglass className="w-4 h-4"/> Need More Time</h4>
          
          <div className="grid grid-cols-2 gap-2 text-sm text-zinc-700 dark:text-zinc-300 mt-2 pl-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`time-${message.id}`} value="7" onChange={(e) => setSelectedTime(e.target.value)} className="accent-orange-500 w-4 h-4" />
              7 Days
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`time-${message.id}`} value="15" onChange={(e) => setSelectedTime(e.target.value)} className="accent-orange-500 w-4 h-4" />
              15 Days
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`time-${message.id}`} value="30" onChange={(e) => setSelectedTime(e.target.value)} className="accent-orange-500 w-4 h-4" />
              30 Days
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`time-${message.id}`} value="custom" onChange={(e) => setSelectedTime(e.target.value)} className="accent-orange-500 w-4 h-4" />
              Custom
            </label>
          </div>

          {selectedTime === "custom" && (
            <input 
              type="text" 
              placeholder="Enter days" 
              className="mt-1 px-3 py-1.5 text-sm border border-orange-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white dark:bg-zinc-800"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
            />
          )}

          <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1 pl-1">
             <Info className="w-3 h-3" /> (You can request one time only)
          </div>

          {((selectedTime && selectedTime !== "custom") || (selectedTime === "custom" && customTime)) ? (
            <button 
              onClick={() => {
                const val = selectedTime === "custom" ? customTime : selectedTime;
                if (onRespond && val) onRespond(`Need More Time: ${val} Days`);
              }}
              className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-2 rounded-full transition-colors font-medium cursor-pointer"
            >Submit Request</button>
          ) : null}
        </div>

        {/* Yes Match Is Final Card */}
        <div 
          onClick={() => onRespond && onRespond("Yes, Match Is Final")}
          className="flex-1 p-3 border border-green-200 bg-green-50 dark:bg-green-950/30 rounded-lg flex flex-col justify-center text-center cursor-pointer hover:bg-green-100 transition-colors"
        >
          <h4 className="font-bold text-green-600 flex items-center justify-center gap-1"><CheckCircle2 className="w-5 h-5"/> Yes, Match Is Final</h4>
          <p className="text-[11px] text-green-800/80 mt-3 font-medium">I confirm that this match has reached a final agreement.</p>
        </div>

        {/* No Still Under Discussion Card */}
        <div 
          onClick={() => onRespond && onRespond("No, Still Under Discussion")}
          className="flex-1 p-3 border border-rose-200 bg-rose-50 dark:bg-rose-950/30 rounded-lg flex flex-col justify-center text-center cursor-pointer hover:bg-rose-100 transition-colors"
        >
          <h4 className="font-bold text-rose-600 flex items-center justify-center gap-1"><XCircle className="w-5 h-5"/> No, Still Under Discussion</h4>
          <p className="text-[11px] text-rose-800/80 mt-3 font-medium">We are still discussing and not final yet.</p>
        </div>

      </div>
    </div>
  );
}
