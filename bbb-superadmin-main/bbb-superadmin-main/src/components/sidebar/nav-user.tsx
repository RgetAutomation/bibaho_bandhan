"use client";

import { LogOut } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
//import { signOut } from "next-auth/react";

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
                  router.replace("/auth/login");
                },
              },
            })
          }
          size={"default"}
          className="border-destructive text-destructive hover:bg-destructive border hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
