import PaymentDetailsClientPage from "./paymentClient";
import { Role } from "@/types/Role";
import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { ILoggedInUser } from "@/components/helper/getSession";

export default async function PaymentDetailsPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const user: ILoggedInUser | null = await checkRoleAndGetSession([Role.ADMIN]);
  const { paymentId } = await params;
  const userId = user.id as string;

  return <PaymentDetailsClientPage userId={userId} paymentId={paymentId} />;
}
