import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import BridesForChatClient from "./bridesForChatClient";

export default async function AllBridesForChat() {
  await checkRoleAndGetSession([Role.GHOTOK]);
  return <BridesForChatClient />;
}
