export const dynamic = "force-dynamic";

import { getTeamUserConversationMessages } from "@/action/conversation";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import TeamUserChatClient from "./teamUserChatClient";

export default async function TeamUserChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ convId: string }>;
  searchParams: Promise<{ path: string }>;
}) {
  const { convId } = await params;
  const { path } = await searchParams;
  await checkAuthAndGetSession(await headers());
  const messages = await getTeamUserConversationMessages(convId);
  return (
    <TeamUserChatClient
      path={path === "admin" ? "admin" : "moderator"}
      conversationId={convId}
      conversation={messages}
    />
  );
}
