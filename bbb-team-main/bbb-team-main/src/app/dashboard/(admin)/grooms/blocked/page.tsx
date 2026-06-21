import { Role } from "@/types/Role";
import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import BlockedGroomClient from "./blockedGroomClient";

export default async function BlockedGroomPage() {
  await checkRoleAndGetSession([Role.ADMIN]);

  return <BlockedGroomClient />;
}
