import { getAllModeratorsForChat } from "@/action/teams";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import ModeratorChatClient from "./moderatorChatClient";

export default async function MessageModeratorPage() {
  await checkAuthAndGetSession(await headers());
  const moderators = await getAllModeratorsForChat();
  return <ModeratorChatClient moderators={moderators} />;
}
