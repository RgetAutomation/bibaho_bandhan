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
  DEFAULT_MENU_ACCOUNT_PROFILE_PATH,
  DEFAULT_MENU_CHANGE_PASSWORD_PATH,
  DEFAULT_MENU_DASHBOARD_PATH,
} from "@/lib/constant";

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
