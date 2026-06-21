export const dynamic = "force-dynamic";

import { getAdminModeratorConversationMessages } from "@/action/conversation";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import AdminModeratorChatClient from "./adminModeratorChatClient";

export default async function AdminModeratorChat({
  params,
}: {
  params: Promise<{ convId: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { convId } = await params;
  const messages = await getAdminModeratorConversationMessages(convId);
  return (
    <AdminModeratorChatClient conversationId={convId} conversation={messages} />
  );
}
