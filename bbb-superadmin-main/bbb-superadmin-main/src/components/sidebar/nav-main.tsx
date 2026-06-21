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
import { useNotificationStore } from "@/hooks/useNotificationStore";

interface Props {
  menu: MenuGroupProps[];
}

export function NavMain({ menu }: Props) {
  const pathname = usePathname();
  const { open, setOpenMobile } = useSidebar();

  const {
    adminConversationIds,
    moderatorConversationIds,
    ghotokConversationIds,
    userSAConversationIds,
  } = useNotificationStore();

  return menu.map((group) => (
    <SidebarGroup key={group.label}>
      <SidebarGroupLabel className="text-sm">{group.label}</SidebarGroupLabel>

      <SidebarMenu>
        {group.items.map((item) => {
          const badgeCount =
            item.badgeKey === "messageAdmins"
              ? adminConversationIds.length
              : item.badgeKey === "messageModerators"
                ? moderatorConversationIds.length
                : item.badgeKey === "messageGhotoks"
                  ? ghotokConversationIds.length
                  : item.badgeKey === "messageMatchingGroom"
                    ? userSAConversationIds.length
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
                <Link href={item.url} onClick={() => setOpenMobile(false)}>
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
                    <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
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
  ));
}
