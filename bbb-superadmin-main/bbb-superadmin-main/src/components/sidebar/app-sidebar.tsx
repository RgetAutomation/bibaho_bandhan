"use client";

import {
  CalendarClock,
  CircleUser,
  ClipboardList,
  CreditCard,
  Gem,
  BadgePercent,
  History,
  IndianRupee,
  Key,
  KeyRound,
  Layers,
  Link,
  LucideIcon,
  LucideLayoutDashboard,
  Megaphone,
  MessageCircle,
  MessageCircleHeart,
  MessageCircleWarning,
  MessageSquareDot,
  MessageSquareQuote,
  MessagesSquareIcon,
  Share,
  ShieldBan,
  Star,
  Ticket,
  User2Icon,
  UserRoundCog,
  UsersRound,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  APP_NAME,
  APP_TAG_LINE,
  DEFAULT_MENU_ACCOUNT_PROFILE_PATH,
  DEFAULT_MENU_ACCOUNT_PROFILE_TITLE,
  DEFAULT_MENU_CHANGE_PASSWORD_PATH,
  DEFAULT_MENU_CHANGE_PASSWORD_TITLE,
  DEFAULT_MENU_DASHBOARD_PATH,
  DEFAULT_MENU_DASHBOARD_TITLE,
} from "@/lib/constant";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export interface UserProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface MenuProps {
  title: string;
  url: string;
  icon: LucideIcon;
  badgeKey?: string;
}

export interface MenuGroupProps {
  label: string;
  items: MenuProps[];
}

export interface MainMenuProps {
  menu: MenuGroupProps[];
}

// This is sample data.
const data: MainMenuProps = {
  menu: [
    {
      label: "Main Menu",
      items: [
        {
          title: DEFAULT_MENU_DASHBOARD_TITLE,
          url: DEFAULT_MENU_DASHBOARD_PATH,
          icon: LucideLayoutDashboard,
        },
        {
          title: "Conversations",
          url: "/dashboard/conversations",
          icon: MessageCircle,
        },
        {
          title: "Total Conversation",
          url: "/dashboard/conversations/totalassigned",
          icon: MessageSquareDot,
        },
        {
          title: "Verify Profiles",
          url: "/dashboard/verify-profiles",
          icon: ShieldBan,
        },
        {
          title: "Success Stories",
          url: "/dashboard/success-stories",
          icon: Star,
        },
      ],
    },

    {
      label: "Chat",
      items: [
        {
          title: "Chat Team Manager",
          url: "/dashboard/message/admins",
          icon: MessagesSquareIcon,
          badgeKey: "messageAdmins",
        },
        {
          title: "Chat Team Member",
          url: "/dashboard/message/moderators",
          icon: MessagesSquareIcon,
          badgeKey: "messageModerators",
        },
        {
          title: "Chat Matchmaker",
          url: "/dashboard/message/ghotoks",
          icon: MessagesSquareIcon,
          badgeKey: "messageGhotoks",
        },
      ],
    },

    {
      label: "Matchings",
      items: [
        {
          title: "Matching Room",
          url: "/dashboard/matching-room",
          icon: MessageCircleHeart,
        },
        {
          title: "Chat Match Groom",
          url: "/dashboard/message/matching",
          icon: MessagesSquareIcon,
          badgeKey: "messageMatchingGroom",
        },
        {
          title: "Matching Payments",
          url: "/dashboard/payment/matching",
          icon: IndianRupee,
        },
        {
          title: "Paid Matching",
          url: "/dashboard/grooms/matched",
          icon: CircleUser,
        },
      ],
    },
    {
      label: "Team & Users",
      items: [
        {
          title: "Admins",
          url: "/dashboard/admins",
          icon: UsersRound,
        },
        {
          title: "Moderators",
          url: "/dashboard/moderators",
          icon: UsersRound,
        },
        {
          title: "Matchmakers",
          url: "/dashboard/ghotok",
          icon: UserRoundCog,
        },
        {
          title: "Brides",
          url: "/dashboard/brides",
          icon: CircleUser,
        },
        {
          title: "Grooms",
          url: "/dashboard/grooms",
          icon: CircleUser,
        },
        {
          title: "Plan Expire Groom",
          url: "/dashboard/payment/due",
          icon: CalendarClock,
        },
      ],
    },

    {
      label: "Communication",
      items: [
        {
          title: "Help Request",
          url: "/dashboard/request/help",
          icon: MessageCircleWarning,
        },
        {
          title: "Message Grooms",
          url: "/dashboard/message/grooms",
          icon: MessagesSquareIcon,
        },
        {
          title: "Message Brides",
          url: "/dashboard/message/brides",
          icon: MessagesSquareIcon,
        },
        {
          title: "Broadcasting Messages",
          url: "/dashboard/message/broadcast",
          icon: Megaphone,
        },
      ],
    },
    {
      label: "Payments & Access",
      items: [
        {
          title: "Subscription Payments",
          url: "/dashboard/payment/subscription",
          icon: CreditCard,
        },
        {
          title: "Subscription Plans",
          url: "/dashboard/plans",
          icon: Gem,
        },
        {
          title: "Discounts",
          url: "/dashboard/discounts",
          icon: BadgePercent,
        },
        {
          title: "Coupon Code",
          url: "/dashboard/coupon",
          icon: Ticket,
        },
        {
          title: "Team Profile Verification",
          url: "/dashboard/request/profile",
          icon: ClipboardList,
        },
        {
          title: "Matchmaker Join Requests",
          url: "/dashboard/request/ghotok",
          icon: Link,
        },
        {
          title: "Team Login Sessions",
          url: "/dashboard/sessions",
          icon: Key,
        },
        {
          title: "My Login Sessions",
          url: "/dashboard/my-sessions",
          icon: Key,
        },
      ],
    },

    {
      label: "Reports & Others",
      items: [
        {
          title: "Direct User's Report",
          url: "/dashboard/reported/users",
          icon: MessageCircleWarning,
        },
        {
          title: "Team Reported Users",
          url: "/dashboard/reported/team",
          icon: MessageCircleWarning,
        },
        {
          title: "Team Chat Templates",
          url: "/dashboard/templates/chat",
          icon: Layers,
        },
        {
          title: "Chat Reject Templates",
          url: "/dashboard/templates/reject",
          icon: Layers,
        },
      ],
    },

    {
      label: "Feedbacks",
      items: [
        {
          title: "Social Media Share",
          url: "/dashboard/social-share",
          icon: Share,
        },
        {
          title: "Matchmaker Reviews",
          url: "/dashboard/ghotok-reviews",
          icon: Star,
        },
        {
          title: "Front Page Feedbacks",
          url: "/dashboard/feedbacks",
          icon: MessageSquareQuote,
        },
      ],
    },

    {
      label: "Chat History",
      items: [
        {
          title: "Bride Chat History",
          url: "/dashboard/history/bride",
          icon: History,
        },
        {
          title: "Groom Chat History",
          url: "/dashboard/history/groom",
          icon: History,
        },
        {
          title: "Admin & Groom History",
          url: "/dashboard/history/admin-groom",
          icon: History,
        },
        {
          title: "Moderator & Bride History",
          url: "/dashboard/history/moderator-bride",
          icon: History,
        },
        {
          title: "Admin & Moderator",
          url: "/dashboard/history/admin-moderator",
          icon: History,
        },
        {
          title: "Old Conversations",
          url: "/dashboard/history/old-conversations",
          icon: History,
        },
        {
          title: "Rejected Messages",
          url: "/dashboard/rejected-message",
          icon: MessageCircleWarning,
        },
        // {
        //   title: "Ghotok & User History",
        //   url: "/dashboard/history/ghotok-user",
        //   icon: History,
        // },
      ],
    },
    {
      label: "Account",
      items: [
        {
          title: "System Settings",
          url: "/dashboard/settings",
          icon: UserRoundCog,
        },
        {
          title: DEFAULT_MENU_ACCOUNT_PROFILE_TITLE,
          url: DEFAULT_MENU_ACCOUNT_PROFILE_PATH,
          icon: User2Icon,
        },
        {
          title: DEFAULT_MENU_CHANGE_PASSWORD_TITLE,
          url: DEFAULT_MENU_CHANGE_PASSWORD_PATH,
          icon: KeyRound,
        },
      ],
    },
  ],
};

export function AppSidebar() {
  const { resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(resolvedTheme === "dark");
  }, [resolvedTheme]);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Image
              src={isDark ? "/logo_light.svg" : "/logo_dark.svg"}
              width={100}
              height={100}
              alt="logo"
              className="size-9"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="text-primary truncate font-semibold text-wrap uppercase dark:text-white">
              {APP_NAME}
            </span>
            {APP_TAG_LINE && (
              <span className="text-primary/80 truncate text-xs dark:text-white/80">
                {APP_TAG_LINE}
              </span>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="pb-2">
        <NavMain menu={data.menu} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
