import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import GhotoUserSaChatClientPage from "./ghotoUserSaChatClient";
import { Role } from "@/types/Role";

export default async function MessageTeamChatPage({
  params,
}: {
  params: Promise<{ convId: string }>;
}) {
  const { convId } = await params;
  const user = await checkRoleAndGetSession([Role.GHOTOK]);
  return <GhotoUserSaChatClientPage convId={convId} userId={user.id} />;
}
