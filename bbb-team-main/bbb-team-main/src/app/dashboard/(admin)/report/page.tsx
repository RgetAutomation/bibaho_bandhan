import { Role } from "@/types/Role";
import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import ReportedGroomClient from "./reportedGroomClient";

export default async function ReportedGroomPage() {
  await checkRoleAndGetSession([Role.ADMIN]);
  return <ReportedGroomClient />;
}
