"use client";

import { useAuthSession } from "@/hooks/useAuthSession";
import { redirect } from "next/navigation";

export function useGetAuthorization(requiredRole?: string[]) {
  const { user, session } = useAuthSession();

  // Not signed in
  if (!user?.id) {
    redirect("/auth/login");
  }

  // Signed in but wrong role
  if (requiredRole && !requiredRole.includes(user?.type as string)) {
    redirect("/users/unauthorized");
  }

  return { user, session }; // authorized
}
