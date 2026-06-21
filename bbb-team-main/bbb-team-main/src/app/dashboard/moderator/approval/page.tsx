import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import MessageApprovalClient from "./messageApprovalClient";

export default async function ApprovalConversationPage() {
  await checkRoleAndGetSession([Role.MODERATOR]);
  return <MessageApprovalClient />;
}
