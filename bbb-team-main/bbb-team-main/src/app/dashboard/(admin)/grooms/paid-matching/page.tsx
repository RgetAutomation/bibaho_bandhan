import { Role } from "@/types/Role";
import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import PaidMatchingGroomClient from "./paidMatchingGroomClient";

export default async function PaidMatchingGroomPage() {
  await checkRoleAndGetSession([Role.ADMIN]);

  //return <PaidMatchingGroomClient />;
}
