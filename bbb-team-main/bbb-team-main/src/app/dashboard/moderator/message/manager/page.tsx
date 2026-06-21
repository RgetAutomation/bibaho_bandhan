export const dynamic = "force-dynamic";

import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import ManagerChatClientPage from "./managerChatClient";

export default async function MessageTeamMember() {
  await checkRoleAndGetSession([Role.MODERATOR]);
  return <ManagerChatClientPage />;
}
