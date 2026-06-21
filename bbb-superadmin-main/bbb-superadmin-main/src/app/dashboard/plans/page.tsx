export const dynamic = "force-dynamic";

import { getAllPlan } from "@/action/plan";
import { EpmptyList } from "@/components/emptyList";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import Link from "next/link";
import PlanCardView from "./clientComponent";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function PlanPage() {
  await checkAuthAndGetSession(await headers());
  const plans = await getAllPlan();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between p-2 md:p-4 lg:p-6">
        <h1 className="text-lg font-bold md:text-xl lg:text-2xl">
          Subscription Plans
        </h1>
        <Button asChild>
          <Link href="/dashboard/plans/new">
            <PlusCircleIcon className="h-4 w-4" />
            <span>Create new Plan</span>
          </Link>
        </Button>
      </div>
      <div className="flex flex-1 flex-col">
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4">
            {plans.map((plan) => (
              <PlanCardView key={plan.id} {...plan} />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-4">
            <EpmptyList
              title="No Plan Found"
              subtitle="Please add some plan to get started."
            />
          </div>
        )}
      </div>
    </div>
  );
}
