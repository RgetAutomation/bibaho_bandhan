"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Crown,
  Home,
  LucideIcon,
  MessageCircle,
  MessageCircleHeart,
  UserRound,
  Moon,
  Sun,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  ShieldAlert,
  HelpCircle,
  User,
  HeartHandshake,
  Bookmark,
  MailOpen,
  Megaphone,
} from "lucide-react";
import { UserType } from "@/components/enum/userType";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAllInterestReceived } from "@/actions/userConnections";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { MAIN_API_URL } from "@/lib/constant-data";

interface MenuProps {
  href: string;
  label: string;
  icon: LucideIcon;
  userType: UserType[]; // optional if some nav items are global
  badgeKey?: string;
}

const navItems: MenuProps[] = [];

export default function TopNavbarSection() {
  const pathname = usePathname();
  const { user } = useAuthSession();
  const { userConversationIds, teamConversationIds, userSAConversationIds } =
    useNotificationStore();

  const { resolvedTheme, setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

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

  useEffect(() => {
    setMounted(true);
    setIsDarkMode(resolvedTheme === "dark");
  }, [resolvedTheme]);

  if (!mounted || !user) return null;

  return (
    <header className="hidden md:flex items-center justify-between px-8 h-16 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50">
      <div className="flex items-center">
        <Image src="/logo/logo_light.svg" alt="Bangali Bibaho" width={180} height={40} className="h-10 w-auto dark:hidden" priority />
        <Image src="/logo/logo_dark.svg" alt="Bangali Bibaho" width={180} height={40} className="h-10 w-auto hidden dark:block" priority />
      </div>

      <nav className="flex items-center h-full">
        <ul className="flex items-center gap-1">
          {navItems
            .filter((item) => item.userType.includes(user?.type as UserType))
            .map((item) => {
              const messageCount = userConversationIds.length;
              const accountCount =
                userSAConversationIds.length + teamConversationIds.length;

              const showMessageBadge =
                item.badgeKey === "messageBadge" && messageCount > 0;

              const showAccountBadge =
                item.badgeKey === "accountBadge" && accountCount > 0;
              const showBadge = showMessageBadge || showAccountBadge;

              const isActive =
                pathname === item.href || pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <li key={item.href} className="flex items-center">
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-primary"
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      {showBadge && (
                        <Badge className="absolute -top-2 -right-2 size-4 rounded-full text-[10px] flex items-center justify-center p-0">
                          {showMessageBadge ? messageCount : accountCount}
                        </Badge>
                      )}
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          <li className="flex items-center">
            {/* Dynamic Premium Banner */}
            <Link 
              href="/users/membership" 
              className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-950/40 dark:to-rose-950/40 border border-orange-100/50 dark:border-orange-900/50 hover:shadow-sm transition-all"
            >
              <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-[#C81A3C] leading-tight">
                  {user?.type === UserType.PAID_USER ? "Premium Member" : "Upgrade to Premium"}
                </span>
                <span className="text-[9px] text-gray-600 dark:text-zinc-400 font-semibold leading-tight">
                  {user?.type === UserType.PAID_USER ? "Enjoying Premium Benefits" : "Unlock Premium Benefits"}
                </span>
              </div>
            </Link>
          </li>
          <li className="flex items-center ml-3 pl-3 border-l border-gray-200 dark:border-zinc-800 gap-4">

            {/* Broadcast Icon */}
            {activeBroadcast && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-broadcast'))}
                className="relative p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors outline-none"
                title="View Announcement"
              >
                <Megaphone className="w-5 h-5 animate-pulse" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-zinc-950 rounded-full"></span>
              </button>
            )}

            {/* Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger className="relative group outline-none">
                <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-muted-foreground group-hover:text-primary transition-colors">
                  <Bell className="w-5 h-5" />
                </div>
                {totalNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-5 rounded-full text-[10px] flex items-center justify-center p-0 border-2 border-white dark:border-zinc-950 bg-[#E51E44] text-white">
                    {totalNotifications}
                  </Badge>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl shadow-xl mt-2 p-0 overflow-hidden border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Notifications</h3>
                  {totalNotifications > 0 && (
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {totalNotifications} New
                    </span>
                  )}
                </div>
                
                <div className="max-h-[350px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                      <div className="bg-zinc-100 dark:bg-zinc-800/50 p-3 rounded-full mb-3">
                        <Bell className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <p className="text-[13px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">All caught up!</p>
                      <p className="text-[11px] text-zinc-500 max-w-[200px]">You have no new notifications right now. Check back later.</p>
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 transition-all duration-300 text-muted-foreground hover:text-primary"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                <Avatar className="w-9 h-9 border-2 border-transparent hover:border-primary transition-all">
                  <AvatarImage src={user.image || (user.gender === "MALE" ? "/groom.webp" : "/bride.webp")} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start ml-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-extrabold text-gray-900 dark:text-white leading-tight">{(user as any).name} {(user as any).lastName || ""}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-semibold leading-tight">ID: {user.publicId}</span>
                </div>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer py-2 text-red-600 focus:text-red-600"
                  onClick={() =>
                    authClient.signOut({
                      fetchOptions: {
                        onRequest: () => setLoggingOut(true),
                        onSuccess: () => router.push("/auth/login"),
                        onError: () => setLoggingOut(false),
                      },
                    })
                  }
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{loggingOut ? "Logging out..." : "Logout"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        </ul>
      </nav>
    </header>
  );
}
