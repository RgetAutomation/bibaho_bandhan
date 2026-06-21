"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ADMIN_MENU_BLOCKED_GROOMS_PATH,
  ADMIN_MENU_CONVERSATIONS_PATH,
  ADMIN_MENU_END_PLAN_GROOMS_PATH,
  ADMIN_MENU_FREE_GROOMS_PATH,
  ADMIN_MENU_MATCHING_ROOM_PATH,
  ADMIN_MENU_MESSAGE_GROOMS_PATH,
  ADMIN_MENU_HELP_REQUEST_TITLE_PATH,
  ADMIN_MENU_MESSAGE_TEAM_MEMBER_PATH,
  ADMIN_MENU_PAID_GROOMS_PATH,
  ADMIN_MENU_PAID_MATCHING_PATH,
  ADMIN_MENU_REPORTED_GROOM_PATH,
  ADMIN_MENU_TOTAL_CONVERSATION_PATH,
  DEFAULT_MENU_ACCOUNT_PROFILE_PATH,
  DEFAULT_MENU_CHANGE_PASSWORD_PATH,
  DEFAULT_MENU_DASHBOARD_PATH,
  GHOTOK_MENU_CONNECTION_REQUEST_PATH,
  GHOTOK_MENU_MY_BRIDES_PATH,
  GHOTOK_MENU_MY_GROOMS_PATH,
  GHOTOK_MENU_PAID_MATCHING_PATH,
  TEAM_MENU_APPROVAL_CONVERSATIONS_PATH,
  TEAM_MENU_ASSIGNED_WORK_PATH,
  TEAM_MENU_MATCHING_CONVERSATIONS_PATH,
  TEAM_MENU_MESSAGE_BRIDE_PATH,
  TEAM_MENU_MESSAGE_TEAM_MANAGER_PATH,
  TEAM_MENU_REPORT_HISTORY_PATH,
  GHOTOK_MENU_BRIDES_CHATS_PATH,
  GHOTOK_MENU_GROOMS_CHATS_PATH,
} from "../helper/constant";

export function HeaderBreadcrumbs() {
  const pathname = usePathname();

  const labelMap: Record<string, string> = {
    dashboard: "Dashboard",
    grooms: "Grooms",
    free: "Free Grooms",
    paid: "Paid Grooms",
    "end-plan": "End Plans Grooms",
    request: "Message Requests",
    approval: "Approval Conversations",
    assigned: "Assigned Works",
    starred: "Matching Conversations",
    bride: "Bride's Message",
    manager: "Contact Team Manager",
    reported: "Reported Groom",
  };

  const validRoutes = new Set([
    DEFAULT_MENU_DASHBOARD_PATH,
    DEFAULT_MENU_ACCOUNT_PROFILE_PATH,
    DEFAULT_MENU_CHANGE_PASSWORD_PATH,
    ADMIN_MENU_CONVERSATIONS_PATH,
    ADMIN_MENU_MATCHING_ROOM_PATH,
    ADMIN_MENU_TOTAL_CONVERSATION_PATH,
    ADMIN_MENU_FREE_GROOMS_PATH,
    ADMIN_MENU_PAID_GROOMS_PATH,
    ADMIN_MENU_END_PLAN_GROOMS_PATH,
    ADMIN_MENU_BLOCKED_GROOMS_PATH,
    ADMIN_MENU_PAID_MATCHING_PATH,
    ADMIN_MENU_HELP_REQUEST_TITLE_PATH,
    ADMIN_MENU_MESSAGE_GROOMS_PATH,
    ADMIN_MENU_MESSAGE_TEAM_MEMBER_PATH,
    ADMIN_MENU_REPORTED_GROOM_PATH,
    TEAM_MENU_APPROVAL_CONVERSATIONS_PATH,
    TEAM_MENU_ASSIGNED_WORK_PATH,
    TEAM_MENU_MATCHING_CONVERSATIONS_PATH,
    TEAM_MENU_MESSAGE_BRIDE_PATH,
    TEAM_MENU_MESSAGE_TEAM_MANAGER_PATH,
    TEAM_MENU_REPORT_HISTORY_PATH,
    GHOTOK_MENU_MY_BRIDES_PATH,
    GHOTOK_MENU_MY_GROOMS_PATH,
    GHOTOK_MENU_BRIDES_CHATS_PATH,
    GHOTOK_MENU_GROOMS_CHATS_PATH,
    GHOTOK_MENU_CONNECTION_REQUEST_PATH,
    GHOTOK_MENU_PAID_MATCHING_PATH,
  ]);

  const segments = pathname.split("/").filter(Boolean);

  // Generate full breadcrumb objects
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label =
      labelMap[segment] ??
      segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      label,
      href,
      isLast: index === segments.length - 1,
    };
  });

  // Only keep breadcrumbs that exist
  const visibleBreadcrumbs = breadcrumbs.filter((b) => validRoutes.has(b.href));

  if (visibleBreadcrumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {visibleBreadcrumbs.map((crumb, index) => (
          <BreadcrumbItem key={index}>
            {crumb.isLast ? (
              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
