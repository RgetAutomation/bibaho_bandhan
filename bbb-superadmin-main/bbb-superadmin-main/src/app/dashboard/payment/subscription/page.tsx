export const dynamic = "force-dynamic";

import { getSubscriptionPayments } from "@/action/payment";
import SubscriptionClient from "./subscriptionClient";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { getAllAdminsForPayment } from "@/action/teams";

export default async function SubscriptionPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ teamId?: string; page?: string; sortBy?: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { teamId, page, sortBy } = await searchParams;
  const teams = await getAllAdminsForPayment();
  const { data, total, totalPages } = await getSubscriptionPayments({
    page: Number(page ?? 1),
    limit: 9,
    teamId,
    sortBy: sortBy ?? "all",
  });
  return (
    <SubscriptionClient
      payments={data}
      total={total}
      totalPages={totalPages}
      currentPage={page}
      teamId={teamId}
      teams={teams}
    />
  );
}
