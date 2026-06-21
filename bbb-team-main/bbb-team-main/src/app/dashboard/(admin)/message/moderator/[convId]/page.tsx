import { Role } from "@/types/Role";
import ChatWithModeratorClientPage from "./chatClient";
import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { ILoggedInUser } from "@/components/helper/getSession";

export default async function ChatWithModeratorPage({
  params,
}: {
  params: Promise<{ convId: string }>;
}) {
  const session: ILoggedInUser | null = await checkRoleAndGetSession([
    Role.ADMIN,
  ]);
  const { convId: conversationId } = await params;
  const currentUserId = session?.id as string;

  return (
    <ChatWithModeratorClientPage
      conversationId={conversationId}
      currentUserId={currentUserId}
    />
  );
}
