export const dynamic = "force-dynamic";

import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import GroomClientComponent from "./groomClient";

export default async function MessageGroomMain() {
  const user = await checkRoleAndGetSession([Role.ADMIN]);
  return <GroomClientComponent currentUserId={user.id} />;
}
