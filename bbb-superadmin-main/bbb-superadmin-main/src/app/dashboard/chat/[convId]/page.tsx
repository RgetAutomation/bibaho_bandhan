import ChatClientPage from "./chatClient";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ convId: string }>;
}) {
  const { convId } = await params;
  const user = await checkAuthAndGetSession(await headers());
  const currentUserId = user.id as string;
  return (
    <ChatClientPage conversationId={convId} currentUserId={currentUserId} />
  );
}
