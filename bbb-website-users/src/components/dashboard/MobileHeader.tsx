"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Crown, Bell, User, Settings, HelpCircle, LogOut, ChevronDown, MessageCircle, MailOpen, HeartHandshake, AlignRight, X, LayoutDashboard, Flame, Bookmark, MessageSquare, Users, Ban, Megaphone } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { isPaidUser } from "@/lib/utils";
import { UserType } from "@/components/enum/userType";
import { useEffect, useState } from "react";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getAllInterestReceived } from "@/actions/userConnections";
import axios from "axios";
import { MAIN_API_URL } from "@/lib/constant-data";
interface MobileHeaderProps {
  hideLogo?: boolean;
  className?: string;
}

export default function MobileHeader({ hideLogo = false, className }: MobileHeaderProps = {}) {
  const { user } = useAuthSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { userConversationIds, teamConversationIds, userSAConversationIds } = useNotificationStore();
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: receivedInterests } = useQuery({
    queryKey: ["receivedInterests"],
    queryFn: () => getAllInterestReceived(),
    enabled: !!user && user.type === UserType.PAID_USER,
  });

  const { data: activeBroadcasts } = useQuery({
    queryKey: ["activeBroadcasts"],
    queryFn: async () => {
      const res = await axios.get(`${MAIN_API_URL}/broadcasts/active`, { withCredentials: true });
      return res.data?.data || [];
    },
    enabled: !!user,
  });

  const activeBroadcast = activeBroadcasts?.[0];

  const messageCount = userConversationIds.length;
  const matchNoticeCount = userSAConversationIds.length;
  const interestCount = receivedInterests?.length || 0;
  const totalNotifications = messageCount + matchNoticeCount + interestCount;

  const [hasViewedNotifications, setHasViewedNotifications] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  useEffect(() => {
    if (totalNotifications > lastNotificationCount) {
      setHasViewedNotifications(false);
    }
    setLastNotificationCount(totalNotifications);
  }, [totalNotifications, lastNotificationCount]);

  const showNotificationBadge = !hasViewedNotifications && totalNotifications > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  const isPaid = isPaidUser(
    user.type as UserType,
    new Date(user.planExpiryDate ?? "")
  );

  const notifications = [
    ...(messageCount > 0 ? [{
      id: 'messages',
      type: 'message',
      title: 'New Messages',
      desc: `You have ${messageCount} unread message${messageCount > 1 ? 's' : ''}`,
      icon: MessageCircle,
      href: '/users/chat',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    }] : []),
    ...(matchNoticeCount > 0 ? [{
      id: 'matches',
      type: 'match',
      title: 'Match Updates',
      desc: `You have ${matchNoticeCount} match notice update${matchNoticeCount > 1 ? 's' : ''}`,
      icon: MailOpen,
      href: '/users/team',
      color: 'text-rose-500',
      bgColor: 'bg-rose-100 dark:bg-rose-900/30'
    }] : []),
    ...(interestCount > 0 ? [{
      id: 'interests',
      type: 'interest',
      title: 'Connection Interests',
      desc: `You have ${interestCount} pending interest${interestCount > 1 ? 's' : ''}`,
      icon: HeartHandshake,
      href: '/users/interests?type=received',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    }] : [])
  ];

  return (
    <div className={className ?? "flex md:hidden items-center justify-between bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800/80 px-4 py-3 shrink-0 z-40 relative"}>
      {/* Logo */}
      {!hideLogo && (
        <div className="flex items-center">
          <Image
            src="/logo/logo_light.svg"
            alt="Bangali Bibaho"
            width={150}
            height={36}
            className="h-9 w-auto dark:hidden"
            priority
          />
          <Image
            src="/logo/logo_dark.svg"
            alt="Bangali Bibaho"
            width={150}
            height={36}
            className="h-9 w-auto hidden dark:block"
            priority
          />
        </div>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Broadcast Icon */}
        {activeBroadcast && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-broadcast'))}
            className="relative p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors outline-none"
            title="View Announcement"
          >
            <Megaphone className="w-5 h-5 animate-pulse" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-zinc-950 rounded-full"></span>
          </button>
        )}

        {/* Notification Bell */}
        <DropdownMenu onOpenChange={(open) => {
          if (open) setHasViewedNotifications(true);
        }}>
          <DropdownMenuTrigger className="relative group outline-none">
            <div className="p-1.5 text-gray-500 hover:text-[#9B1C31] transition-colors">
              <Bell className="w-5 h-5" />
            </div>
            {showNotificationBadge && (
              <Badge className="absolute top-0 right-0 size-4 rounded-full text-[9px] font-bold flex items-center justify-center p-0 border-2 border-white dark:border-zinc-950 bg-[#E51E44] text-white">
                {totalNotifications}
              </Badge>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[calc(100vw-24px)] md:w-72 rounded-2xl shadow-xl mt-2 p-0 overflow-hidden border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Notifications</h3>
              {totalNotifications > 0 && (
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {totalNotifications} New
                </span>
              )}
            </div>
            
            <div className="max-h-[300px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {notifications.length > 0 ? (
                <div className="flex flex-col">
                  {notifications.map((notification, idx) => {
                    const Icon = notification.icon;
                    return (
                      <div key={notification.id}>
                        <DropdownMenuItem asChild className="p-0 focus:bg-zinc-50 dark:focus:bg-zinc-800/50 cursor-pointer">
                          <Link href={notification.href} className="flex items-start gap-3 p-4 transition-colors">
                            <div className={`p-2 rounded-xl shrink-0 ${notification.bgColor}`}>
                              <Icon className={`w-4 h-4 ${notification.color}`} />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 mb-0.5 leading-tight">{notification.title}</span>
                              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-snug">{notification.desc}</span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        {idx < notifications.length - 1 && <DropdownMenuSeparator className="m-0 bg-zinc-100 dark:bg-zinc-800" />}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <div className="bg-zinc-100 dark:bg-zinc-800/50 p-3 rounded-full mb-3">
                    <Bell className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <p className="text-[13px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">All caught up!</p>
                  <p className="text-[11px] text-zinc-500">You have no new notifications.</p>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="shrink-0 outline-none">
            <Avatar className="w-8 h-8 border border-gray-200 dark:border-zinc-700 shadow-xs hover:border-[#9B1C31] transition-all">
              <AvatarImage src={user.image || ((user as any).gender === "MALE" ? "/groom.webp" : "/bride.webp")} className="object-cover" />
              <AvatarFallback className="bg-rose-50 text-[#9B1C31] text-xs font-bold">
                {user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg mt-2">
            <div className="flex flex-col space-y-1 p-2 border-b">
              <p className="text-sm font-medium leading-none">{(user as any).name} {(user as any).lastName || ""}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.publicId}</p>
            </div>
            <DropdownMenuItem asChild className="cursor-pointer py-2">
              <Link href={`/users/profile/${user.id}`}>
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            
            {/* Theme Toggle */}
            <DropdownMenuItem 
              className="cursor-pointer py-2"
              onClick={(e) => {
                e.preventDefault();
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
              }}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="mr-2 h-4 w-4 text-muted-foreground" />
              ) : (
                <Moon className="mr-2 h-4 w-4 text-muted-foreground" />
              )}
              <span>{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer py-2">
              <Link href="/users/account">
                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer py-2">
              <Link href="/users/helpcenter">
                <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Help Center</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Hamburger / Fries Menu Button */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <AlignRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 transition-opacity">
          {/* Click outside to close */}
          <div className="absolute inset-0" onClick={() => setIsSidebarOpen(false)} />
          
          {/* Sidebar Drawer */}
          <div className="relative w-64 bg-white dark:bg-zinc-950 h-[100dvh] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-zinc-800">
              <span className="font-bold text-gray-900 dark:text-white">Menu</span>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-zinc-800 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {[
                { label: "Dashboard", icon: LayoutDashboard, href: "/users/home" },
                { label: "My Profile", icon: User, href: `/users/profile/${user.id}` },
                { label: "Interests", icon: HeartHandshake, href: "/users/interests", badge: interestCount > 0 ? interestCount : undefined },
                { label: "My Matches", icon: Flame, href: "/users/matching" },
                { label: "Shortlist", icon: Bookmark, href: "/users/shortlist" },
                { label: "Messages", icon: MessageSquare, href: "/users/chat", badge: messageCount > 0 ? messageCount : undefined },
                { label: "Match Notice", icon: Users, href: "/users/team", badge: matchNoticeCount > 0 ? matchNoticeCount : undefined, hideForFemale: true },
                { label: "Blocked List", icon: Ban, href: "/users/blocked" },
                { label: "Premium Membership", icon: Crown, href: "/users/membership", hideForFemale: true },
                { label: "Account Settings", icon: Settings, href: "/users/account" },
                { label: "Help & Support", icon: HelpCircle, href: "/users/helpcenter" },
              ]
              .filter(item => !(user?.gender === "FEMALE" && item.hideForFemale))
              .map((item, idx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/users/home" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#E51E44] text-white shadow-md shadow-[#E51E44]/10"
                        : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/60 hover:text-[#E51E44] dark:hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-gray-400 dark:text-zinc-500"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
