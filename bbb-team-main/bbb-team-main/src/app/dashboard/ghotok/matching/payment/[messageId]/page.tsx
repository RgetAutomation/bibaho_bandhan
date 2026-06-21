import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import MatchingPaymentClient from "./matchingPaymentClient";
import { Role } from "@/types/Role";

export default async function PaidMatchingPaymentPage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  const { messageId } = await params;
  await checkRoleAndGetSession([Role.GHOTOK]);
  return <MatchingPaymentClient messageId={messageId} />;
}
