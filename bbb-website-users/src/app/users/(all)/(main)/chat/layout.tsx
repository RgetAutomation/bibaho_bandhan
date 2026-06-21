import React from "react";
import ChatSidebarClient from "./ChatSidebarClient";

export default function MessageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-gray-50 dark:bg-zinc-950">
      
      {/* Left Sidebar (Dynamic Chat List) */}
      <ChatSidebarClient />

      {/* Right Content Area (Actual Chat) */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-900 relative">
        {children}
      </div>

    </div>
  );
}
