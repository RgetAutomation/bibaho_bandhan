import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import StarredConversationClient from "./starredConversationClient";

export default async function StarredConversation() {
  await checkRoleAndGetSession([Role.MODERATOR]);
  return <StarredConversationClient />;
}
