export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { getAllOldConversation } from "@/action/conversation";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import OldConversationClient from "./oldConversationClient";

export default async function OldConversationPage() {
  await checkAuthAndGetSession(await headers());
  const oldConversations = await getAllOldConversation();
  return <OldConversationClient conversations={oldConversations} />;
}
