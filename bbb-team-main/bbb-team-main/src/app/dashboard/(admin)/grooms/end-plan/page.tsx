import { Role } from "@/types/Role";
import EndPlanGroomClient from "./endPlanGroomClient";
import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";

export default async function EndPlanGroomPage() {
  await checkRoleAndGetSession([Role.ADMIN]);

  return <EndPlanGroomClient />;
}
