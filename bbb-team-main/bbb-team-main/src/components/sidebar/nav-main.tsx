"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MenuGroupProps } from "./app-sidebar";
import { Role } from "@/types/Role";
import { useGhotokNotificationStore } from "@/hooks/ghotok/useGhotokNotificationStore";
import { useModeratorNotificationStore } from "@/hooks/moderator/useModeratorNotificationStore";
import { useTeamSANotificationStore } from "@/hooks/useTeamSANotificationStore";
import { useAdminNotificationStore } from "@/hooks/admin/useAdminNotificationStore";
import { useMessageApprovalNotificationStore } from "@/hooks/moderator/useMessageApprovalNotificationStore";
import { useQuery } from "@tanstack/react-query";
import { getAllGhotokUserConnectionRequest } from "@/actions/ghotok";

interface Props {
  userId: string;
  role: Role;
  menu: MenuGroupProps[];
}

export function NavMain({ userId, role, menu }: Props) {
  const pathname = usePathname();
  const { open, setOpenMobile } = useSidebar();
  const {
    brideConversationIds: brideConvCount,
    groomConversationIds: groomConvCount,
    matchingConversationIds,
  } = useGhotokNotificationStore();
  const { adminModeratorConversationIds, brideConversationIds } =
    useModeratorNotificationStore();
  const { groomConversationIds } = useAdminNotificationStore();
  const { teamHeadMessageCount, resetTeamHeadMessage } =
    useTeamSANotificationStore();
  const { messageApprovalCount } = useMessageApprovalNotificationStore();

  const { data: connectionRequests } = useQuery({
    queryKey: ["getAllGhotokUsersConnectionReq"],
    queryFn: () => getAllGhotokUserConnectionRequest(),
    enabled: role === Role.GHOTOK,
  });

  const connectionRequestCount =
    connectionRequests?.filter((req) => req.receiver.isGhotokOwned)?.length || 0;

  return menu.map((group) =>
    group.role && !group.role.includes(role) ? null : (
      <SidebarGroup key={group.label}>
        <SidebarGroupLabel className="text-sm">{group.label}</SidebarGroupLabel>

        <SidebarMenu>
          {group.items.map((item) => {
            if (item.role && !item.role.includes(role)) return null;

            const badgeCount =
              item.badgeKey === "connectionRequestBadge"
                ? connectionRequestCount
                : item.badgeKey === "messageBrideGhotokBadge"
                ? brideConvCount.length
                : item.badgeKey === "messageGroomGhotokBadge"
                  ? groomConvCount.length
                  : item.badgeKey === "messageSABadge"
                    ? teamHeadMessageCount
                    : item.badgeKey === "messageAdminModeratorBadge"
                      ? adminModeratorConversationIds.length
                      : item.badgeKey === "messageBrideBadge"
                        ? brideConversationIds.length
                        : item.badgeKey === "messageGroomBadge"
                          ? groomConversationIds.length
                          : item.badgeKey === "messageSAUserBadge"
                            ? matchingConversationIds.length
                            : item.badgeKey === "messageApprovalBadge"
                              ? messageApprovalCount
                              : 0;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  variant={pathname === item.url ? "outline" : "default"}
                  className={cn(
                    pathname === item.url &&
                      "bg-primary/90 hover:bg-primary text-white hover:text-white"
                  )}
                  asChild
                >
                  <Link
                    href={item.url}
                    onClick={() => {
                      setOpenMobile(false);
                      if (item.badgeKey === "messageSABadge")
                        resetTeamHeadMessage();
                    }}
                    className="flex w-full items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {open ? (
                        item.icon && <item.icon className="size-4" />
                      ) : (
                        <div className="flex aspect-square items-center justify-center">
                          {item.icon && <item.icon className="size-4" />}
                        </div>
                      )}
                      <span>{item.title}</span>
                    </div>

                    {/* 🔴 BADGE */}
                    {badgeCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    )
  );
}
