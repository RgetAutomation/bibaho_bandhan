import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import PaymentsClientPage from "./paymentsClient";

export default async function PaymentsPage() {
  await checkRoleAndGetSession([Role.ADMIN]);

  return <PaymentsClientPage />;
}
