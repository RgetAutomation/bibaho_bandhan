import HelpClientPage from "./helpClient";
import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";

export default async function HelpRequestPage() {
  await checkRoleAndGetSession([Role.ADMIN]);
  return <HelpClientPage />;
}
