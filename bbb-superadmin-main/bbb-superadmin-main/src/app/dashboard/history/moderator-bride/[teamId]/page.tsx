export const dynamic = "force-dynamic";

import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import SelectBrideClient from "./selectBrideClient";
import { headers } from "next/headers";
import { getUserTeamConversationByTeamId } from "@/action/conversation";

export default async function SelectGrooms({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  await checkAuthAndGetSession(await headers());
  const allTeamUsersConversation =
    await getUserTeamConversationByTeamId(teamId);
  return <SelectBrideClient conversations={allTeamUsersConversation} />;
}
