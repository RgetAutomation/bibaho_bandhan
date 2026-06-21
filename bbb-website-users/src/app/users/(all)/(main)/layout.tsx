"use client";

import FooterSection from "@/components/dashboard/footer";
import TopNavbarSection from "@/components/dashboard/TopNavbarSection";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { ProfileCompleteGuard } from "@/components/profileCompleteGuard";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Suspense, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { session, user, isPending } = useAuthSession();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [pathname]);

  return (
    <div className="flex flex-col h-screen bg-gray-50/50 dark:bg-zinc-950 overflow-hidden">
      {/* Top Navbar (hidden on xl, replaced by sidebar logo) */}
      <TopNavbarSection />

      <div className="flex flex-1 w-full overflow-hidden">
        {/* Persistent Left Sidebar */}
        <Suspense fallback={<div>Loading sidebar...</div>}>
          <DashboardSidebar />
        </Suspense>

        {/* Main Content Area */}
        <div
          ref={containerRef}
          className="flex flex-col flex-1 min-w-0 overflow-y-auto"
        >
          <main className="flex flex-col flex-1 min-h-0">
            <ProfileCompleteGuard
              session={session}
              user={user}
              isPending={isPending}
            >
              {children}
            </ProfileCompleteGuard>
          </main>

          {/* Bottom Navigation (mobile) */}
          <FooterSection />
        </div>
      </div>
    </div>
  );
}

