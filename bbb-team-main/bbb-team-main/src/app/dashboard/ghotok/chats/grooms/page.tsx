import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import GroomsForChatClient from "./groomsForChatClient";

export default async function AllGroomsForChat() {
  await checkRoleAndGetSession([Role.GHOTOK]);
  return <GroomsForChatClient />;
}
