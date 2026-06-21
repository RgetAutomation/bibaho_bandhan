import ChatClientPage from "./chatClient";
import { Role } from "@/types/Role";
import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { ILoggedInUser } from "@/components/helper/getSession";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ convId: string }>;
}) {
  const { convId } = await params;
  const user: ILoggedInUser | null = await checkRoleAndGetSession([Role.ADMIN]);
  const currentUserId = user.id as string;
  return (
    <ChatClientPage conversationId={convId} currentUserId={currentUserId} />
  );
}
