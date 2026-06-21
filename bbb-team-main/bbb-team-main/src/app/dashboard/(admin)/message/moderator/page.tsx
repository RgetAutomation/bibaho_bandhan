export const dynamic = "force-dynamic";

import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import ModeratorChatClientPage from "./moderatorChatClient";

export default async function MessageTeamMember() {
  await checkRoleAndGetSession([Role.ADMIN]);
  return <ModeratorChatClientPage />;
}
