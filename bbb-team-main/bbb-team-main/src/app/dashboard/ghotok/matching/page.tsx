import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import MatchingUsersClient from "./matchingUsersClient";

export default async function ChatMatchingGroom() {
  const user = await checkRoleAndGetSession([Role.GHOTOK]);
  return <MatchingUsersClient currentUserId={user.id} />;
}
