"use client";

import { SocketProvider } from "@/components/contexts/SocketContext";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session } = useAuthSession();
  return (
    <div className="flex flex-col min-h-screen bg-zinc-100 dark:bg-background">
      <div className="w-full flex flex-col flex-1 mx-auto bg-white dark:bg-zinc-900 md:bg-transparent md:dark:bg-transparent">
        {session?.token ? (
          <SocketProvider token={`USER_${session.token}`}>
            {children}
          </SocketProvider>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
