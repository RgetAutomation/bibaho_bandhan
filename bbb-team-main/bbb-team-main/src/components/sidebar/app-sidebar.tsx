"use client";

import * as React from "react";
import {
  BadgeHelpIcon,
  BadgeIndianRupee,
  Ban,
  BriefcaseBusiness,
  CircleCheckIcon,
  Flag,
  KeyRound,
  LucideIcon,
  LucideLayoutDashboard,
  Mail,
  MessageCircle,
  MessageCircleHeart,
  MessageSquare,
  MessageSquareDot,
  MessagesSquare,
  ShieldBan,
  Star,
  User2Icon,
  UserRoundCheck,
  UserRoundMinus,
  UserRoundX,
  Users,
  UsersRound,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  APP_NAME,
  APP_TAG_LINE,
  DEFAULT_MENU_ACCOUNT_PROFILE_TITLE,
  DEFAULT_MENU_ACCOUNT_PROFILE_PATH,
  DEFAULT_MENU_CHANGE_PASSWORD_TITLE,
  DEFAULT_MENU_CHANGE_PASSWORD_PATH,
  DEFAULT_MENU_DASHBOARD_TITLE,
  DEFAULT_MENU_DASHBOARD_PATH,
  ADMIN_MENU_CONVERSATIONS_TITLE,
  ADMIN_MENU_CONVERSATIONS_PATH,
  ADMIN_MENU_MATCHING_ROOM_TITLE,
  ADMIN_MENU_MATCHING_ROOM_PATH,
  ADMIN_MENU_TOTAL_CONVERSATION_TITLE,
  ADMIN_MENU_TOTAL_CONVERSATION_PATH,
  ADMIN_MENU_FREE_GROOMS_TITLE,
  ADMIN_MENU_FREE_GROOMS_PATH,
  ADMIN_MENU_PAID_GROOMS_TITLE,
  ADMIN_MENU_PAID_GROOMS_PATH,
  ADMIN_MENU_END_PLAN_GROOMS_TITLE,
  ADMIN_MENU_END_PLAN_GROOMS_PATH,
  ADMIN_MENU_BLOCKED_GROOMS_TITLE,
  ADMIN_MENU_BLOCKED_GROOMS_PATH,
  ADMIN_MENU_PAID_MATCHING_TITLE,
  ADMIN_MENU_PAID_MATCHING_PATH,
  ADMIN_MENU_HELP_REQUEST_TITLE,
  ADMIN_MENU_HELP_REQUEST_TITLE_PATH,
  ADMIN_MENU_MESSAGE_GROOMS_TITLE,
  ADMIN_MENU_MESSAGE_GROOMS_PATH,
  ADMIN_MENU_MESSAGE_TEAM_MEMBER_TITLE,
  ADMIN_MENU_MESSAGE_TEAM_MEMBER_PATH,
  ADMIN_MENU_REPORTED_GROOM_TITLE,
  ADMIN_MENU_REPORTED_GROOM_PATH,
  ADMIN_MENU_PAYMENT_TITLE,
  ADMIN_MENU_PAYMENT_PATH,
  TEAM_MENU_APPROVAL_CONVERSATIONS_TITLE,
  TEAM_MENU_APPROVAL_CONVERSATIONS_PATH,
  TEAM_MENU_ASSIGNED_WORK_TITLE,
  TEAM_MENU_ASSIGNED_WORK_PATH,
  TEAM_MENU_MATCHING_CONVERSATIONS_TITLE,
  TEAM_MENU_MATCHING_CONVERSATIONS_PATH,
  TEAM_MENU_MESSAGE_BRIDE_PATH,
  TEAM_MENU_MESSAGE_BRIDE_TITLE,
  TEAM_MENU_MESSAGE_TEAM_MANAGER_PATH,
  TEAM_MENU_MESSAGE_TEAM_MANAGER_TITLE,
  TEAM_MENU_REPORT_HISTORY_TITLE,
  TEAM_MENU_REPORT_HISTORY_PATH,
  TEAM_MENU_STARRED_CONVERSATIONS_TITLE,
  TEAM_MENU_STARRED_CONVERSATIONS_PATH,
  TEAM_MENU_REJECTED_MESSAGE_TITLE,
  TEAM_MENU_REJECTED_MESSAGE_PATH,
  GHOTOK_MENU_CONNECTION_REQUEST_PATH,
  GHOTOK_MENU_CONNECTION_REQUEST_TITLE,
  GHOTOK_MENU_PAID_MATCHING_PATH,
  GHOTOK_MENU_PAID_MATCHING_TITLE,
  DEFAULT_MENU_MESSAGE_MANAGER_TITLE,
  DEFAULT_MENU_MESSAGE_MANAGER_PATH,
  GHOTOK_MENU_MY_BRIDES_TITLE,
  GHOTOK_MENU_MY_BRIDES_PATH,
  GHOTOK_MENU_MY_GROOMS_TITLE,
  GHOTOK_MENU_MY_GROOMS_PATH,
  GHOTOK_MENU_REPORT_HISTORY_TITLE,
  GHOTOK_MENU_REPORT_HISTORY_PATH,
  GHOTOK_MENU_CHAT_MATCH_GROOM_TITLE,
  GHOTOK_MENU_CHAT_MATCH_GROOM_PATH,
  GHOTOK_MENU_BRIDES_CHATS_PATH,
  GHOTOK_MENU_BRIDES_CHATS_TITLE,
  GHOTOK_MENU_GROOMS_CHATS_TITLE,
  GHOTOK_MENU_GROOMS_CHATS_PATH,
} from "@/components/helper/constant";
import { Role } from "@/types/Role";
import Image from "next/image";
import { useTheme } from "next-themes";

export interface UserProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface MenuProps {
  title: string;
  url: string;
  icon: LucideIcon;
  role: Role[]; // Optional: specify roles that can access this menu item
  badgeKey?: string;
}

export interface MenuGroupProps {
  label: string;
  items: MenuProps[];
  role: Role[];
}

export interface MainMenuProps {
  menu: MenuGroupProps[];
}

// This is sample data.
const data: MainMenuProps = {
  menu: [
    {
      label: "Main Menu",
      role: [Role.ADMIN, Role.MODERATOR, Role.GHOTOK],
      items: [
        {
          title: DEFAULT_MENU_DASHBOARD_TITLE,
          url: DEFAULT_MENU_DASHBOARD_PATH,
          icon: LucideLayoutDashboard,
          role: [Role.ADMIN, Role.MODERATOR, Role.GHOTOK], // Only Admin and User can access this
        },
        {
          title: ADMIN_MENU_CONVERSATIONS_TITLE,
          url: ADMIN_MENU_CONVERSATIONS_PATH,
          icon: MessageCircle,
          role: [Role.ADMIN], // Only Admin and User can access this
        },
        {
          title: ADMIN_MENU_TOTAL_CONVERSATION_TITLE,
          url: ADMIN_MENU_TOTAL_CONVERSATION_PATH,
          icon: MessageSquareDot,
          role: [Role.ADMIN], // Only Admin and User can access this
        },
        {
          title: ADMIN_MENU_MATCHING_ROOM_TITLE,
          url: ADMIN_MENU_MATCHING_ROOM_PATH,
          icon: MessageCircleHeart,
          role: [Role.ADMIN], // Only Admin and User can access this
        },
        {
          title: TEAM_MENU_APPROVAL_CONVERSATIONS_TITLE,
          url: TEAM_MENU_APPROVAL_CONVERSATIONS_PATH,
          icon: CircleCheckIcon,
          role: [Role.MODERATOR], // Only Admin and User can access this
          badgeKey: "messageApprovalBadge",
        },
        {
          title: TEAM_MENU_ASSIGNED_WORK_TITLE,
          url: TEAM_MENU_ASSIGNED_WORK_PATH,
          icon: BriefcaseBusiness,
          role: [Role.MODERATOR], // Only Admin and User can access this
        },
        {
          title: TEAM_MENU_STARRED_CONVERSATIONS_TITLE,
          url: TEAM_MENU_STARRED_CONVERSATIONS_PATH,
          icon: Star,
          role: [Role.MODERATOR], // Only Admin and User can access this
        },
        {
          title: TEAM_MENU_MATCHING_CONVERSATIONS_TITLE,
          url: TEAM_MENU_MATCHING_CONVERSATIONS_PATH,
          icon: MessageCircleHeart,
          role: [Role.MODERATOR], // Only Admin and User can access this
        },
        {
          title: "Verify Profiles",
          url: "/dashboard/verify-profiles",
          icon: ShieldBan,
          role: [Role.ADMIN, Role.MODERATOR],
        },
        {
          title: GHOTOK_MENU_CONNECTION_REQUEST_TITLE,
          url: GHOTOK_MENU_CONNECTION_REQUEST_PATH,
          icon: Users,
          role: [Role.GHOTOK], // Only Admin and User can access this
          badgeKey: "connectionRequestBadge",
        },
      ],
    },

    {
      label: "Communication",
      role: [Role.ADMIN, Role.MODERATOR, Role.GHOTOK],
      items: [
        {
          title: ADMIN_MENU_MESSAGE_GROOMS_TITLE,
          url: ADMIN_MENU_MESSAGE_GROOMS_PATH,
          icon: MessageSquare,
          role: [Role.ADMIN], // Only Admin and User can access this
          badgeKey: "messageGroomBadge",
        },
        {
          title: ADMIN_MENU_MESSAGE_TEAM_MEMBER_TITLE,
          url: ADMIN_MENU_MESSAGE_TEAM_MEMBER_PATH,
          icon: Mail,
          role: [Role.ADMIN], // Only Admin and User can access this
          badgeKey: "messageAdminModeratorBadge",
        },
        {
          title: TEAM_MENU_MESSAGE_BRIDE_TITLE,
          url: TEAM_MENU_MESSAGE_BRIDE_PATH,
          icon: MessageCircle,
          role: [Role.MODERATOR], // Only Admin and User can access this
          badgeKey: "messageBrideBadge",
        },
        {
          title: TEAM_MENU_MESSAGE_TEAM_MANAGER_TITLE,
          url: TEAM_MENU_MESSAGE_TEAM_MANAGER_PATH,
          icon: MessageSquare,
          role: [Role.MODERATOR], // Only Admin and User can access this
          badgeKey: "messageAdminModeratorBadge",
        },
        {
          title: DEFAULT_MENU_MESSAGE_MANAGER_TITLE,
          url: DEFAULT_MENU_MESSAGE_MANAGER_PATH,
          icon: MessageSquareDot,
          role: [Role.ADMIN, Role.MODERATOR], // Only Admin and User can access this
          badgeKey: "messageSABadge",
        },
        {
          title: GHOTOK_MENU_BRIDES_CHATS_TITLE,
          url: GHOTOK_MENU_BRIDES_CHATS_PATH,
          icon: MessageCircle,
          role: [Role.GHOTOK], // Only Admin and User can access this
          badgeKey: "messageBrideGhotokBadge",
        },
        {
          title: GHOTOK_MENU_GROOMS_CHATS_TITLE,
          url: GHOTOK_MENU_GROOMS_CHATS_PATH,
          icon: MessageCircle,
          role: [Role.GHOTOK], // Only Admin and User can access this
          badgeKey: "messageGroomGhotokBadge",
        },
        {
          title: GHOTOK_MENU_CHAT_MATCH_GROOM_TITLE,
          url: GHOTOK_MENU_CHAT_MATCH_GROOM_PATH,
          icon: MessagesSquare,
          role: [Role.GHOTOK, Role.ADMIN], // Show to Ghotok and Admin
          badgeKey: "messageSAUserBadge",
        },
        {
          title: "Message Team",
          url: DEFAULT_MENU_MESSAGE_MANAGER_PATH,
          icon: MessageSquareDot,
          role: [Role.GHOTOK], // Only Admin and User can access this
          badgeKey: "messageSABadge",
        },
        {
          title: TEAM_MENU_REPORT_HISTORY_TITLE,
          url: TEAM_MENU_REPORT_HISTORY_PATH,
          icon: Flag,
          role: [Role.MODERATOR], // Only Admin and User can access this
        },
        {
          title: TEAM_MENU_REJECTED_MESSAGE_TITLE,
          url: TEAM_MENU_REJECTED_MESSAGE_PATH,
          icon: Ban,
          role: [Role.MODERATOR], // Only Admin and User can access this
        },
        {
          title: ADMIN_MENU_HELP_REQUEST_TITLE,
          url: ADMIN_MENU_HELP_REQUEST_TITLE_PATH,
          icon: BadgeHelpIcon,
          role: [Role.ADMIN], // Only Admin and User can access this
        },
      ],
    },

    {
      label: "Grooms Menu",
      role: [Role.ADMIN],
      items: [
        {
          title: ADMIN_MENU_FREE_GROOMS_TITLE,
          url: ADMIN_MENU_FREE_GROOMS_PATH,
          icon: UserRoundMinus,
          role: [Role.ADMIN], // Only Admin and User can access this
        },
        {
          title: ADMIN_MENU_PAID_GROOMS_TITLE,
          url: ADMIN_MENU_PAID_GROOMS_PATH,
          icon: UserRoundCheck,
          role: [Role.ADMIN], // Only Admin and User can access this
        },
        {
          title: ADMIN_MENU_END_PLAN_GROOMS_TITLE,
          url: ADMIN_MENU_END_PLAN_GROOMS_PATH,
          icon: UserRoundX,
          role: [Role.ADMIN], // Only Admin and User can access this
        },
        {
          title: ADMIN_MENU_BLOCKED_GROOMS_TITLE,
          url: ADMIN_MENU_BLOCKED_GROOMS_PATH,
          icon: ShieldBan,
          role: [Role.ADMIN], // Only Admin and User can access this
        },
      ],
    },

    {
      label: "Payments & Others",
      role: [Role.ADMIN],
      items: [
        {
          title: ADMIN_MENU_PAYMENT_TITLE,
          url: ADMIN_MENU_PAYMENT_PATH,
          icon: BadgeIndianRupee,
          role: [Role.ADMIN], // Only Admin and User can access this
        },
        {
          title: ADMIN_MENU_PAID_MATCHING_TITLE,
          url: ADMIN_MENU_PAID_MATCHING_PATH,
          icon: BadgeIndianRupee,
          role: [Role.ADMIN], // Only Admin and User can access this
        },
        {
          title: ADMIN_MENU_REPORTED_GROOM_TITLE,
          url: ADMIN_MENU_REPORTED_GROOM_PATH,
          icon: Flag,
          role: [Role.ADMIN], // Only Admin and User can access this
        },
      ],
    },

    {
      label: "Users",
      role: [Role.GHOTOK],
      items: [
        {
          title: GHOTOK_MENU_MY_BRIDES_TITLE,
          url: GHOTOK_MENU_MY_BRIDES_PATH,
          icon: UsersRound,
          role: [Role.GHOTOK], // Only Ghotok User can access this
        },
        {
          title: GHOTOK_MENU_MY_GROOMS_TITLE,
          url: GHOTOK_MENU_MY_GROOMS_PATH,
          icon: UsersRound,
          role: [Role.GHOTOK], // Only Ghotok User can access this
        },
        {
          title: "Home Groom",
          url: "/dashboard/ghotok/home-grooms",
          icon: UsersRound,
          role: [Role.GHOTOK],
        },
        {
          title: "Home Bride",
          url: "/dashboard/ghotok/home-brides",
          icon: UsersRound,
          role: [Role.GHOTOK],
        },
      ],
    },

    {
      label: "Others",
      role: [Role.GHOTOK],
      items: [
        {
          title: GHOTOK_MENU_PAID_MATCHING_TITLE,
          url: GHOTOK_MENU_PAID_MATCHING_PATH,
          icon: BadgeIndianRupee,
          role: [Role.GHOTOK], // Only Ghotok and User can access this
        },
        {
          title: GHOTOK_MENU_REPORT_HISTORY_TITLE,
          url: GHOTOK_MENU_REPORT_HISTORY_PATH,
          icon: Flag,
          role: [Role.GHOTOK], // Only Ghotok and User can access this
        },
      ],
    },

    {
      label: "Account",
      role: [Role.ADMIN, Role.MODERATOR, Role.GHOTOK],
      items: [
        {
          title: DEFAULT_MENU_ACCOUNT_PROFILE_TITLE,
          url: DEFAULT_MENU_ACCOUNT_PROFILE_PATH,
          icon: User2Icon,
          role: [Role.ADMIN, Role.MODERATOR, Role.GHOTOK], // Both Admin and User can access this
        },
        {
          title: DEFAULT_MENU_CHANGE_PASSWORD_TITLE,
          url: DEFAULT_MENU_CHANGE_PASSWORD_PATH,
          icon: KeyRound,
          role: [Role.ADMIN, Role.MODERATOR, Role.GHOTOK], // Both Admin and User can access this
        },
      ],
    },
  ],
};

export function AppSidebar({ userId, role }: { userId: string; role: string }) {
  const [isDark, setIsDark] = React.useState(false);
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    setIsDark(resolvedTheme === "dark");
  }, [resolvedTheme]);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="hover:bg-primary/10 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Image
              src={isDark ? "/logo_light.svg" : "/logo_dark.svg"}
              alt="logo"
              width={100}
              height={100}
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
      <SidebarContent>
        <NavMain menu={data.menu} userId={userId} role={role as Role} />
      </SidebarContent>
      <SidebarFooter>
        {process.env.NODE_ENV === "development" && <NavUser />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
