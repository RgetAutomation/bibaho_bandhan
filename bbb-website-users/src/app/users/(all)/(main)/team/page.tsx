"use client";
import { MatchingChatClient } from "../matching/matchingChatClient";
import { useAuthSession } from "@/hooks/useAuthSession";
import LoadingPage from "@/components/loader";
import { isPaidUser, NotPaidUserReason } from "@/lib/utils";
import { PlansSection } from "@/components/dashboard/planSection";
import { UserType } from "@/components/enum/userType";

export default function TeamPage() {
  const { user, isPending } = useAuthSession();

  if (isPending) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh]">
        <LoadingPage />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.gender === "FEMALE") {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh] p-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Match Notice Not Required</h2>
        <p className="text-gray-500 dark:text-zinc-400">As a complimentary premium member, you do not need to use the Match Notice feature.</p>
      </div>
    );
  }

  const isPaid = isPaidUser(
    user.type as UserType,
    new Date(user.planExpiryDate ?? "")
  );

  if (!isPaid.paid) {
    return (
      <div className="flex flex-col flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <PlansSection
          showFreeSection={isPaid.reason === NotPaidUserReason.FREE_USER}
          showPlanExpiredSection={isPaid.reason === NotPaidUserReason.PLAN_EXPIRED}
          userType={user.type as UserType}
          planExpiryDate={user.planExpiryDate}
        />
      </div>
    );
  }

  return <MatchingChatClient currentUserId={user.id} />;
}
