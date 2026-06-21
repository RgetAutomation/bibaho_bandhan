"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Crown,
  Home,
  LucideIcon,
  MessageCircle,
  MessageCircleHeart,
  UserRound,
  HeartHandshake,
  Bookmark,
} from "lucide-react";
import { UserType } from "@/components/enum/userType";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { Badge } from "../ui/badge";

interface MenuProps {
  href: string;
  label: string;
  icon: LucideIcon;
  userType: UserType[]; // optional if some nav items are global
  badgeKey?: string;
}

const navItems: MenuProps[] = [
  {
    href: "/users/home",
    label: "Home",
    icon: Home,
    userType: [UserType.PAID_USER, UserType.FREE_USER],
  },
  {
    href: "/users/interests",
    label: "Interests",
    icon: MessageCircleHeart,
    userType: [UserType.PAID_USER],
  },
  {
    href: "/users/shortlist",
    label: "Shortlist",
    icon: Bookmark,
    userType: [UserType.PAID_USER],
  },
  {
    href: "/users/chat",
    label: "Messages",
    icon: MessageCircle,
    userType: [UserType.PAID_USER],
    badgeKey: "messageBadge",
  },
  {
    href: "/users/membership",
    label: "Membership",
    icon: Crown,
    userType: [UserType.PAID_USER, UserType.FREE_USER],
  },
  {
    href: "/users/account",
    label: "Account",
    icon: UserRound,
    userType: [UserType.PAID_USER, UserType.FREE_USER],
    badgeKey: "accountBadge",
  },
];

export default function SidebarSection() {
  const pathname = usePathname();
  const { user } = useAuthSession();
  const { userConversationIds, teamConversationIds, userSAConversationIds } =
    useNotificationStore();

  if (!user) return null;

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary tracking-tight">
          Bangali Bibaho
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4">
        <ul className="flex flex-col gap-2">
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
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
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
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>
    </aside>
  );
}
