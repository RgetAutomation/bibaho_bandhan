import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import AssignedWorkClient from "./assignedWorkClient";

export default async function AssignedWorkPage() {
  await checkRoleAndGetSession([Role.MODERATOR]);
  return <AssignedWorkClient />;
}
