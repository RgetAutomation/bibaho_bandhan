import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import ReportedUserClient from "./reportedUserClient";

export default async function ReportedBridePage() {
  //ensure only admins can view
  await checkRoleAndGetSession([Role.GHOTOK]);
  return <ReportedUserClient />;
}
