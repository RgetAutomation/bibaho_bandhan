"use client";

import { authClient } from "@/lib/auth-client";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

export interface ExtendedUser {
  id: string;
  publicId: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  username?: string | null;
  displayUsername?: string | null;
  title?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  phone?: string;
  type?: string;
  blocked?: boolean;
  isProfileComplete?: boolean;
  isGhotokOwned?: boolean;
  isProfilePublic?: boolean;
  allowSocialPublish?: boolean;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
  totalLimit?: number;
  remainingLimit?: number;
  planStartDate?: string;
  planExpiryDate?: string;
  matchingStartDate?: string;
  matchingExpiryDate?: string;
}

export interface ExtendedSession {
  expiresAt: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string | null | undefined;
  userAgent: string | null | undefined;
  userId: string;
  id: string;
  user: ExtendedUser;
}

export function useAuthSession() {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  //const router = useRouter();

  // useEffect(() => {
  //   if (!session?.session?.token) {
  //     router.replace("/auth/login");
  //   }
  // }, [session, router]);

  return {
    session: session?.session as ExtendedSession | undefined,
    user: session?.user as ExtendedUser | undefined,
    isPending,
    error,
    refetch,
  };
}
