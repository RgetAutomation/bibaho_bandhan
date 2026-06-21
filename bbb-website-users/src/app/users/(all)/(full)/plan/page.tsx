"use client";

import { getPlans } from "@/actions/get-plans";
import ApiErrorPage from "@/components/apiErrorPage";
import DashboardHeader from "@/components/dashboard/header";
import {
  PlanCard,
  PlanCardSkeleton,
  PlansSection,
} from "@/components/dashboard/planSection";
import { UserType } from "@/components/enum/userType";
import LoadingPage from "@/components/loader";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function PremiumPlan() {
  return (
    <Suspense fallback={<div className="p-6">Loading plans...</div>}>
      <PremiumPlanClient />
    </Suspense>
  );
}

function PremiumPlanClient() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("pid");
  const referanceId = searchParams.get("ref");
  const messsageId = searchParams.get("mid");
  const { user, isPending } = useAuthSession();
  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader
        title={
          <div className="w-full flex items-center justify-center gap-2 bg-primary/20 p-4">
            <h1 className="font-semibold text-lg md:text-xl">All Plans</h1>
          </div>
        }
      />
      <div className="flex flex-1 justify-center p-4">
        {planId ? (
          <SelectiveView
            planId={planId}
            referanceId={referanceId}
            messsageId={messsageId}
          />
        ) : (
          <PlansSection
            showFreeSection={false}
            isPending={isPending}
            userType={user?.type as UserType}
          />
        )}
      </div>
    </div>
  );
}

function SelectiveView({
  planId,
  referanceId,
  messsageId,
}: {
  planId: string | undefined;
  referanceId: string | null;
  messsageId: string | null;
}) {
  const {
    data: plans,
    isLoading,
    isPending,
    error,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: () => getPlans(),
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex items-center justify-center flex-col">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to load plans"
      : "Something went wrong";
    return (
      <div className="w-full flex-1 flex items-center justify-center flex-col">
        <ApiErrorPage
          title={"Failed to load plan"}
          description={errorMessage}
        />
      </div>
    );
  }

  const selectedPlan = plans?.find((plan) => plan.id === planId);

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto">
      {/* <div className="flex-1 flex items-center justify-center p-4 md:p-5 lg:p-6">
            <p className="text-gray-500">No chats available</p>
          </div> */}

      {isLoading || isPending ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <PlanCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="w-full px-4">
          {/* Selected Plan */}
          <div className="w-full">
            <h2 className="text-2xl font-bold text-center py-4 mb-6">
              Your Selected Plan
            </h2>

            <div className="flex justify-center px-4">
              <div className="relative w-full max-w-xl">
                {/* Floating Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div
                    className="px-5 py-1.5 text-xs font-semibold tracking-wide 
                      bg-gradient-to-r from-blue-600 to-indigo-600 
                      text-white rounded-full shadow-lg"
                  >
                    ⭐ SELECTED PLAN
                  </div>
                </div>

                {/* Card Wrapper */}
                <div
                  className="
        rounded-3xl 
        p-[2px] 
        bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
        shadow-2xl
      "
                >
                  <div
                    className="
          rounded-3xl 
          bg-white 
          dark:bg-neutral-900
          p-6
        "
                  >
                    <PlanCard
                      id={selectedPlan?.id || ""}
                      title={selectedPlan?.title || ""}
                      price={selectedPlan?.price || ""}
                      connection={selectedPlan?.connection || ""}
                      duration={selectedPlan?.duration || ""}
                      refId={referanceId || ""}
                      mid={messsageId || ""}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Plans */}
          <div className={"flex flex-col gap-2"}>
            <h3 className="text-xl font-semibold text-center my-6">
              Explore Other Plans
            </h3>

            <div className="w-full flex flex-col gap-4">
              {plans
                .filter((plan) => plan.id !== planId)
                .map((plan) => (
                  <div key={plan.id} className="w-full">
                    <PlanCard
                      id={plan.id}
                      title={plan.title}
                      price={plan.price}
                      connection={plan.connection}
                      duration={plan.duration}
                      refId={referanceId || ""}
                      mid={messsageId || ""}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
