import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";

import ConversationClientComponents from "./conversationClient";
import { getGroomConversationsWithModerators } from "@/action/conversation";

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page: string }>;
}) {
  const user = await checkAuthAndGetSession(await headers());
  const { page } = await searchParams;
  const pageNumber = Number(page ?? 1);
  const data = await getGroomConversationsWithModerators({
    page: pageNumber,
    limit: 5,
  });
  return (
    <ConversationClientComponents
      currentUserId={user.id}
      conversations={data.conversations}
      moderators={data.moderators}
      currentPage={pageNumber}
    />
  );
}
