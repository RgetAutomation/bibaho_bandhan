"use client";

import { LogOut } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function NavUser() {
  const router = useRouter();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() =>
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/auth/login");
                },
              },
            })
          }
          size={"default"}
          className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
