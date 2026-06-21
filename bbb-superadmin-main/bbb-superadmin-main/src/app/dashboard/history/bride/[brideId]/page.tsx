export const dynamic = "force-dynamic";

import { getConversationByParticipantsID } from "@/action/conversation";
import { EpmptyList } from "@/components/emptyList";
import React from "react";
import BrideChatHistoryClientPage from "./clientPage";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function LoadAllConversationWithBrideID({
  params,
}: {
  params: Promise<{ brideId: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { brideId } = await params;
  const conversations = await getConversationByParticipantsID(brideId);

  return conversations && conversations.length > 0 ? (
    <BrideChatHistoryClientPage conversations={conversations} />
  ) : (
    <div className="mx-auto flex w-full flex-1 items-center justify-center p-4">
      <EpmptyList
        title="No Conversation Found"
        subtitle="We could not find any conversation with this bride"
      />
    </div>
  );
}
