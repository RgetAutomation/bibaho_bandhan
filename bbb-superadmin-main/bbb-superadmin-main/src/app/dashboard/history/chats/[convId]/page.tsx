export const dynamic = "force-dynamic";

import { getConversationMessages } from "@/action/conversation";
import ChatsHistoryClient from "./chatsHistoryClient";
import { EpmptyList } from "@/components/emptyList";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function ChatsHistoryPage({
  params,
}: {
  params: Promise<{ convId: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { convId } = await params;
  const messages = await getConversationMessages(convId);

  if (!messages) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4 lg:px-4">
        <EpmptyList
          title="No Conversation Found"
          subtitle="We could not find any conversation details to show here."
        />
      </div>
    );
  }

  return <ChatsHistoryClient conversation={messages} />;
}
