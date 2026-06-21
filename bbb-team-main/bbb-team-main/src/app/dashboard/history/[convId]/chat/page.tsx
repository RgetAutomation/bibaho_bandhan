import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import ChatHistoryClient from "./chatHistoryClient";

export default async function ChatHistory({
  params,
}: {
  params: Promise<{ convId: string }>;
}) {
  const { convId } = await params;
  await checkRoleAndGetSession([Role.ADMIN, Role.MODERATOR]);
  return <ChatHistoryClient convId={convId} />;
}
