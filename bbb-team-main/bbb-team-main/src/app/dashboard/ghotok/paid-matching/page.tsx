import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import PaidMatchingGroomClientForGhotok from "./groomListClient";

export default async function PaidMatching() {
  await checkRoleAndGetSession([Role.GHOTOK]);
  return <PaidMatchingGroomClientForGhotok />;
}
