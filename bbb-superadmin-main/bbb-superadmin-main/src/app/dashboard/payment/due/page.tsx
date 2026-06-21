export const dynamic = "force-dynamic";

import { getDuePayments } from "@/action/payment";
import DueClientComponent from "./dueClient";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function DuePaymentPage() {
  await checkAuthAndGetSession(await headers());
  const users = await getDuePayments();

  return <DueClientComponent users={users} />;
}
