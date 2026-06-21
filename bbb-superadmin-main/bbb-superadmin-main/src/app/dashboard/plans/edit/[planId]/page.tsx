export const dynamic = "force-dynamic";

import { getPlanById } from "@/action/plan";
import { EpmptyList } from "@/components/emptyList";
import React from "react";
import EditPlanClientComponent from "./clientComponent";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function EditPlan({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const planId = await params;
  const plan = await getPlanById(planId.planId);

  if (!planId.planId || !plan)
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <EpmptyList
          title="No Plan Found"
          subtitle="Please add some plan to get started."
        />
      </div>
    );

  return <EditPlanClientComponent {...plan} />;
}
