"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExtendedSession, ExtendedUser } from "@/hooks/useAuthSession";
import { UserGender } from "./enum/userGender";

export function ProfileCompleteGuard({
  session,
  user,
  isPending,
  children,
}: {
  session: ExtendedSession | undefined;
  user: ExtendedUser | undefined;
  isPending: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!session || isPending || !user) return;

    const isIncomplete = !user.isProfileComplete;
    if (!isIncomplete) return;

    const shouldRedirect = user.gender === UserGender.FEMALE;

    if (shouldRedirect) {
      router.replace("/users/account/complete");
    }
  }, [session, user, isPending, router]);

  return children;
}
