import { headers } from "next/headers";
import TeamChatClientPage from "./chatClientPage";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { getBrideProfileById } from "@/action/bride";

export default async function MessageTeamChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ convId: string }>;
  searchParams: Promise<{ bid: string; rid: string }>;
}) {
  const user = await checkAuthAndGetSession(await headers());
  const { convId } = await params;
  const { bid, rid } = await searchParams;
  const bride = await getBrideProfileById(bid);

  return (
    <TeamChatClientPage
      convId={convId}
      userId={user.id}
      reportId={rid}
      bride={bride}
    />
  );
}
