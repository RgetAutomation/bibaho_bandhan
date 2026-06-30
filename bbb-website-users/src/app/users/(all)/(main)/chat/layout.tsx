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
      
      {/* --- WATERMARK SECTION (DELETE THIS TO REMOVE THE WATERMARK) --- */}
      <div className="fixed inset-0 z-[999999] pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.03] dark:opacity-5">
        <div className="transform -rotate-45 text-[75px] sm:text-[90px] md:text-[180px] font-black text-black dark:text-white whitespace-nowrap select-none">
          COMPLETED
        </div>
      </div>

    </div>
  );
}
