import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import RejectedMessageClient from "./rejectedMessageClient";

export default async function RejectedMessagePage() {
  await checkRoleAndGetSession([Role.MODERATOR]);
  return <RejectedMessageClient />;
}
