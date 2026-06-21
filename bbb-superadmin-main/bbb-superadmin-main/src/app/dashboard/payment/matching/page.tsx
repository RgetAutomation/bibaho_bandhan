export const dynamic = "force-dynamic";

import { getMatchingPayments } from "@/action/payment";
import MatchingClient from "./matchingClient";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function MatchingPaymentPage() {
  await checkAuthAndGetSession(await headers());
  const payments = await getMatchingPayments();
  return <MatchingClient payments={payments} />;
}
