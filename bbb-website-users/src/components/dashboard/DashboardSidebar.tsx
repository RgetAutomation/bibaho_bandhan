"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Ban,
  Crown,
  Flame,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Send,
  Settings,
  HelpCircle,
  Bookmark,
  Users,
  User,
} from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { useQuery } from "@tanstack/react-query";
import { isPaidUser } from "@/lib/utils";
import { UserType } from "@/components/enum/userType";
import { getAllInterestReceived, getAllInterestSent } from "@/actions/userConnections";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

export default function DashboardSidebar() {
  const { user } = useAuthSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { userConversationIds, teamConversationIds, userSAConversationIds } = useNotificationStore();

  const unreadMessagesCount = userConversationIds.length;
  const accountNotificationCount = userSAConversationIds.length;

  const { data: receivedInterests } = useQuery({
    queryKey: ["receivedInterests"],
    queryFn: () => getAllInterestReceived(),
    enabled: !!user && user.type === UserType.PAID_USER,
  });

  const { data: sentInterests } = useQuery({
    queryKey: ["sentInterests"],
    queryFn: () => getAllInterestSent(),
    enabled: !!user && user.type === UserType.PAID_USER,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) {
    return (
      <aside className="hidden xl:flex w-64 bg-white dark:bg-zinc-950 border-r border-gray-100 dark:border-zinc-800 flex-col shrink-0 p-4 space-y-4 sticky top-0 h-screen overflow-y-auto animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded-md w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-100 dark:bg-zinc-800/50 rounded-xl w-full"></div>
          <div className="h-10 bg-gray-100 dark:bg-zinc-800/50 rounded-xl w-full"></div>
          <div className="h-10 bg-gray-100 dark:bg-zinc-800/50 rounded-xl w-full"></div>
        </div>
      </aside>
    );
  }

  const isPaid = isPaidUser(
    user.type as UserType,
    new Date(user.planExpiryDate ?? "")
  );

  const sidebarNavItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/users/home",
      badge: undefined,
    },
    {
      label: "My Profile",
      icon: User,
      href: `/users/profile/${user.id}`,
      badge: undefined,
    },
    {
      label: "Interests",
      icon: HeartHandshake,
      href: "/users/interests",
      badge: receivedInterests?.length ? String(receivedInterests.length) : undefined,
    },
    {
      label: "My Matches",
      icon: Flame,
      href: "/users/matching",
      badge: undefined,
    },
    {
      label: "Shortlist",
      icon: Bookmark,
      href: "/users/shortlist",
      badge: undefined,
    },
    {
      label: "Messages",
      icon: MessageSquare,
      href: "/users/chat",
      badge: unreadMessagesCount > 0 ? String(unreadMessagesCount) : undefined,
    },
    {
      label: "Match Notice",
      icon: Users,
      href: "/users/team",
      badge: userSAConversationIds.length > 0 ? String(userSAConversationIds.length) : undefined,
    },
    {
      label: "Blocked List",
      icon: Ban,
      href: "/users/blocked",
      badge: undefined,
    },
    {
      label: "Premium Membership",
      icon: Crown,
      href: "/users/membership",
      badge: undefined,
    },
    {
      label: "Account Settings",
      icon: Settings,
      href: "/users/account",
      badge: accountNotificationCount > 0 ? String(accountNotificationCount) : undefined,
    },
    {
      label: "Help & Support",
      icon: HelpCircle,
      href: "/users/helpcenter",
      badge: teamConversationIds.length > 0 ? String(teamConversationIds.length) : undefined,
    },
  ];

  // Filter out Premium Membership and Match Notice if user is FEMALE
  const filteredNavItems = user?.gender === "FEMALE" 
    ? sidebarNavItems.filter(item => item.label !== "Premium Membership" && item.label !== "Match Notice")
    : sidebarNavItems;

  return (
    <aside className="hidden xl:flex w-64 bg-white dark:bg-zinc-950 border-r border-gray-100 dark:border-zinc-800 flex-col shrink-0 p-4 sticky top-0 h-full">
      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex flex-col gap-1">
          {filteredNavItems.map((item, idx) => {
            const Icon = item.icon;
            // Active if exact match (including query params) OR starts with the base path
            let isActive = false;
            if (item.href.includes("?")) {
              const [basePath, query] = item.href.split("?");
              const params = new URLSearchParams(query);
              
              // Only active if both path and the specific query param match
              isActive = pathname === basePath && searchParams.get("type") === params.get("type");
            } else {
              const basePath = item.href;
              isActive = pathname === basePath || (basePath !== "/users/home" && pathname.startsWith(basePath));
            }

            return (
              <li key={idx}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-[#E51E44] text-white shadow-md shadow-[#E51E44]/10"
                      : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/60 hover:text-[#E51E44] dark:hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-gray-400 dark:text-zinc-500 group-hover:text-[#E51E44]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Membership Plan Widget */}
      {user?.gender !== "FEMALE" && (
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-amber-500/5 to-amber-500/10 dark:from-amber-500/10 dark:to-amber-500/20 p-4 rounded-2xl border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <div>
              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider leading-none">
                {isPaid.paid ? "Premium Plan" : "Free Member"}
              </h4>
              {isPaid.paid && user.planExpiryDate && (
                <p className="text-[9px] text-gray-400 dark:text-zinc-400 font-semibold mt-1">
                  Valid till {format(new Date(user.planExpiryDate), "dd MMM yyyy")}
                </p>
              )}
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => router.push("/users/membership")}
            className="w-full rounded-xl text-xs py-2 bg-[#E51E44] hover:bg-[#C81A3C] text-white h-auto border-none shadow-xs font-bold"
          >
            {isPaid.paid ? "Manage Plan" : "Upgrade Plan"}
          </Button>
        </div>
      )}
    </aside>
  );
}
