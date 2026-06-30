"use client";

import React, { useEffect } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserNotification } from "@/hooks/useUserNotification";
import { UserType } from "@/components/enum/userType";

export default function EmptyMessagePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userIdQuery = searchParams.get("userId");
  
  const { user } = useAuthSession();
  const { allConversations, isLoading } = useUserNotification(user?.id as string, user?.type as UserType);

  useEffect(() => {
    if (userIdQuery && !isLoading && allConversations) {
      const conv = allConversations.find(c => c.participant.id === userIdQuery);
      if (conv) {
        router.replace(`/users/chat/${conv.id}`);
      } else {
        router.replace("/users/chat");
      }
    }
  }, [userIdQuery, allConversations, isLoading, router]);

  if (userIdQuery) {
    return (
      <div className="flex w-full h-full items-center justify-center bg-gray-50/50 dark:bg-zinc-950/50">
        <Loader2 className="w-8 h-8 animate-spin text-[#E51E44]" />
      </div>
    );
  }

  return (
    <div className="hidden sm:flex flex-col items-center justify-center w-full h-full bg-gray-50/50 dark:bg-zinc-950/50">
      <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-full shadow-sm flex items-center justify-center mb-4 border border-gray-100 dark:border-zinc-800">
        <MessageSquare className="w-8 h-8 text-gray-400 dark:text-zinc-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Your Messages
      </h2>
      <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 max-w-xs text-center">
        Select a conversation from the sidebar to view your messages or start a new chat.
      </p>
    </div>
  );
}
