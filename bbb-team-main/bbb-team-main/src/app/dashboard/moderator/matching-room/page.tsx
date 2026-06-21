import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import MatchingRoomClient from "./matchingRoomClient";

export default async function MatchingRoom() {
  await checkRoleAndGetSession([Role.MODERATOR]);
  return <MatchingRoomClient />;
}
