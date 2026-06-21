import { headers } from "next/headers";
import TeamChatClientPage from "./chatClientPage";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function MessageTeamChatPage({
  params,
}: {
  params: Promise<{ convId: string }>;
}) {
  const { convId } = await params;
  const user = await checkAuthAndGetSession(await headers());
  return <TeamChatClientPage convId={convId} userId={user.id} />;
}
