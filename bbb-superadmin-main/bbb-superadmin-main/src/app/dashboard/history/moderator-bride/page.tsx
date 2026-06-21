export const dynamic = "force-dynamic";

import { getAllModeratorsForChat } from "@/action/teams";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import ModeratorBrideClient from "./moderatorBrideClient";

export default async function ModeratorBrideConversations() {
  await checkAuthAndGetSession(await headers());
  const moderators = await getAllModeratorsForChat();
  return <ModeratorBrideClient moderators={moderators} />;
}
