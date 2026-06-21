"use client";

import React, { useMemo } from "react";
import { Search, Edit, CheckCircle2, MessageSquare, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserNotification } from "@/hooks/useUserNotification";
import { useSocket } from "@/components/contexts/SocketContext";
import { formatDistanceToNow } from "date-fns";
import { useRouter, useParams } from "next/navigation";
import { UserType } from "@/components/enum/userType";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { useQueryClient } from "@tanstack/react-query";
import { IConversation } from "@/components/interface/IConversation";

export default function ChatSidebarClient() {
  const router = useRouter();
  const params = useParams();
  const activeConvId = params?.convId as string;

  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterMode, setFilterMode] = React.useState<"all" | "unread" | "online" | "verified">("all");
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const { user } = useAuthSession();
  const userType = user?.type as UserType;
  const userId = user?.id as string;

  const { onlineUsers } = useSocket();
  const { allConversations, isLoading } = useUserNotification(userId, userType);
  const { removeConversation } = useNotificationStore();
  const queryClient = useQueryClient();

  const clearUnreadCount = (convId: string) => {
    queryClient.setQueryData(
      ["conversations"],
      (oldData: IConversation[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((conv) =>
          conv.id === convId ? { ...conv, unreadCount: 0 } : conv
        );
      }
    );
    removeConversation(convId);
  };

  const conversations = useMemo(() => {
    if (!allConversations) return [];
    let filtered = allConversations.map((conv) => {
      // Strict safety check: If the user sent the last message, they cannot have unread messages
      const lastMsgSender = conv.lastMessage?.senderId;
      const isSender = lastMsgSender === userId;
      
      return {
        ...conv,
        unreadCount: isSender ? 0 : (conv.unreadCount || 0),
        participant: {
          ...conv.participant,
          isOnline: onlineUsers.has(conv.participant.id),
        } as any,
      };
    });

    // Apply Search Filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((conv) => {
        const name = `${conv.participant?.title || ""} ${conv.participant?.lastName || ""}`.toLowerCase();
        return name.includes(q);
      });
    }

    // Apply Tab Filters
    if (filterMode === "unread") {
      filtered = filtered.filter((conv) => (conv.unreadCount || 0) > 0);
    } else if (filterMode === "online") {
      filtered = filtered.filter((conv) => conv.participant?.isOnline);
    } else if (filterMode === "verified") {
      filtered = filtered.filter((conv) => conv.participant?.isGhotokOwned);
    }

    return filtered;
  }, [allConversations, onlineUsers, searchQuery, filterMode]);

  const totalUnread = allConversations?.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0) || 0;

  if (isCollapsed) {
    return (
      <div className="w-[80px] shrink-0 border-r border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col items-center py-5 h-full transition-all duration-300 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] gap-4">
        <button 
          onClick={() => setIsCollapsed(false)}
          className="bg-[#E51E44] text-white p-2 rounded-xl shadow-md shadow-[#E51E44]/20 hover:bg-[#C81A3C] transition-colors flex items-center justify-center w-10 h-10 shrink-0 mb-2"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto w-full flex flex-col items-center gap-4 scrollbar-hide px-2 pb-4 pt-2">
          {conversations.map((conv) => {
            const p = conv.participant as any;
            const active = conv.id === activeConvId;

            return (
              <div 
                key={conv.id}
                onClick={() => {
                  router.push(`/users/chat/${conv.id}`);
                  clearUnreadCount(conv.id);
                }}
                className={`relative w-[52px] h-[52px] cursor-pointer transition-all hover:scale-105 shrink-0 flex items-center justify-center rounded-full ${active ? 'bg-rose-100 dark:bg-[#E51E44]/20 p-0.5' : ''}`}
                title={`${p?.title || ""} ${p?.lastName || ""}`}
              >
                <div className={`relative w-full h-full rounded-full overflow-hidden border-2 ${active ? 'border-[#E51E44] shadow-md' : 'border-gray-200 dark:border-zinc-700'}`}>
                  <Image src={p?.avatar || (p?.gender === "MALE" ? "/groom.webp" : "/bride.webp")} alt={p?.lastName || "Avatar"} fill className="object-cover" />
                </div>
                
                {p?.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full shadow-sm z-10" />
                )}
                {(conv.unreadCount || 0) > 0 && (
                  <div className="absolute top-0 right-0 w-4 h-4 bg-[#E51E44] text-white text-[9px] font-black flex items-center justify-center border-2 border-white dark:border-zinc-900 rounded-full shadow-sm z-10">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-[380px] shrink-0 border-r border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-full overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 transition-all duration-300">
      
      {/* Header Section */}
      <div className="p-5 flex flex-col gap-4 border-b border-gray-50 dark:border-zinc-800/50 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-black tracking-tight text-gray-900 dark:text-white">
              Messages
            </h1>
            {totalUnread > 0 && (
              <span className="bg-[#E51E44] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                {totalUnread}
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(true)}
            className="bg-[#E51E44] text-white p-2 rounded-xl shadow-md shadow-[#E51E44]/20 hover:bg-[#C81A3C] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-2xl text-[13px] font-medium outline-none focus:ring-2 focus:ring-[#E51E44]/20 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Filters */}
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
            {totalUnread > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${filterMode === "unread" ? "bg-[#E51E44] text-white" : "bg-rose-100 dark:bg-rose-900/40 text-[#E51E44]"}`}>{totalUnread}</span>
            )}
          </button>
          <button 
            onClick={() => setFilterMode("online")}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[11px] font-bold transition-colors ${filterMode === "online" ? "border-[#E51E44]/30 bg-rose-50 dark:bg-[#E51E44]/10 text-[#E51E44]" : "border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300"}`}
          >
            Online
          </button>
          <button 
            onClick={() => setFilterMode("verified")}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[11px] font-bold transition-colors ${filterMode === "verified" ? "border-[#E51E44]/30 bg-rose-50 dark:bg-[#E51E44]/10 text-[#E51E44]" : "border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300"}`}
          >
            Verified
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center text-sm font-semibold text-gray-400">Loading chats...</div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center text-sm font-semibold text-gray-400">No messages yet.</div>
        ) : (
          conversations.map((conv) => {
            const p = conv.participant;
            const age = p?.profile?.age ? `${p.profile.age}` : "";
            const loc = p?.profile?.state ? `${p.profile.state}` : "";
            const active = conv.id === activeConvId;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  router.push(`/users/chat/${conv.id}`);
                  clearUnreadCount(conv.id);
                }}
                className={`flex items-center gap-4 p-4 cursor-pointer transition-colors border-b border-gray-50 dark:border-zinc-800/30 ${
                  active
                    ? "bg-rose-50/50 dark:bg-rose-950/20 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#E51E44] before:rounded-r-full"
                    : "hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-[52px] h-[52px] rounded-full overflow-hidden border border-gray-100 dark:border-zinc-700 shadow-sm relative">
                    <Image src={p?.avatar || (p?.gender === "MALE" ? "/groom.webp" : "/bride.webp")} alt={p?.lastName || "Avatar"} fill className="object-cover" />
                  </div>
                  {p?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full shadow-sm" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-extrabold text-[15px] text-gray-900 dark:text-white flex items-center gap-1">
                      {p?.title} {p?.lastName}
                      {p?.isGhotokOwned && <CheckCircle2 className="w-4 h-4 text-white fill-green-500 shrink-0" />}
                    </h3>
                    {conv.lastMessage?.createdAt && (
                      <span className={`text-[10px] font-bold shrink-0 ${conv.unreadCount > 0 ? "text-[#E51E44]" : "text-gray-400 dark:text-zinc-500"}`}>
                        {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-[11px] text-gray-500 dark:text-zinc-400 font-semibold mb-1 truncate">
                    {age} {age && loc && " • "} {loc}
                  </div>
                  
                  <div className="flex justify-between items-center gap-2">
                    <p className={`text-[13px] truncate ${conv.unreadCount > 0 ? "font-bold text-gray-800 dark:text-zinc-200" : "font-medium text-gray-500 dark:text-zinc-400"}`}>
                      {conv.lastMessage?.content ?? "No messages yet"}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-[#E51E44] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm shadow-[#E51E44]/20">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
