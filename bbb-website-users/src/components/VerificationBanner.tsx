"use client";

import { useAuthSession } from "@/hooks/useAuthSession";
import { AlertTriangle, Clock, XCircle } from "lucide-react";

export default function VerificationBanner() {
  const { user } = useAuthSession();

  if (!user || user.verificationStatus === "APPROVED") {
    return null;
  }

  return (
    <div className={`w-full p-3 flex items-center justify-center gap-2 text-sm font-medium ${
      user.verificationStatus === "REJECTED" 
        ? "bg-red-500 text-white" 
        : "bg-amber-500 text-white"
    }`}>
      {user.verificationStatus === "REJECTED" ? (
        <>
          <XCircle className="w-5 h-5 shrink-0" />
          <span>Your profile verification was rejected. Please contact support to resolve this issue.</span>
        </>
      ) : (
        <>
          <Clock className="w-5 h-5 shrink-0" />
          <span>Your profile is currently under review. You cannot send messages until your profile is approved.</span>
        </>
      )}
    </div>
  );
}
