import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import BrideMessageClient from "./brideMessageClient";

export default async function BrideMessage() {
  const user = await checkRoleAndGetSession([Role.MODERATOR]);
  return <BrideMessageClient currentUserId={user.id} />;
}
