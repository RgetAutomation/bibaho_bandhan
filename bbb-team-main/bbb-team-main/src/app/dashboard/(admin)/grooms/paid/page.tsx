import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import PaidGroomClient from "./paidGroomClient";

export default async function PaidGroomPage() {
  await checkRoleAndGetSession([Role.ADMIN]);

  return <PaidGroomClient />;
}
