"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Crown,
  Home,
  LucideIcon,
  MessageCircle,
  MessageCircleHeart,
  UserRound,
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

export default function FooterSection() {
  const pathname = usePathname();
  const { user } = useAuthSession();
  const { userConversationIds, teamConversationIds, userSAConversationIds } =
    useNotificationStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-auto max-w-md md:max-w-lg bg-card border-t shadow-lg rounded-t-2xl overflow-hidden">
        <ul className="flex justify-around items-center">
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
                <li key={item.href} className="flex-1">
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex flex-col items-center gap-1 py-3 transition-all duration-300 ${
                      isActive
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <div className="relative flex flex-col items-center">
                      {showBadge && (
                        <Badge className="absolute -top-1.5 -right-1.5 size-4 rounded-full text-[10px] flex items-center justify-center p-0">
                          {showMessageBadge ? messageCount : accountCount}
                        </Badge>
                      )}

                      <Icon size={22} strokeWidth={2} />
                    </div>

                    <span className="text-xs">{item.label}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </div>
    </nav>
  );
}
