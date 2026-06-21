import React from "react";
import { MessageSquare } from "lucide-react";

export default function EmptyMessagePage() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50/50 dark:bg-zinc-950/50">
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
