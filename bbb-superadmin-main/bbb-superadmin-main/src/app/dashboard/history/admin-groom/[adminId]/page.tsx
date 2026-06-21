export const dynamic = "force-dynamic";

import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import SelectGroomClient from "./selectGrromClient";
import { headers } from "next/headers";
import { getUserTeamConversationByTeamId } from "@/action/conversation";

export default async function SelectGrooms({
  params,
}: {
  params: Promise<{ adminId: string }>;
}) {
  const { adminId } = await params;
  await checkAuthAndGetSession(await headers());
  const allTeamUsersConversation =
    await getUserTeamConversationByTeamId(adminId);
  return <SelectGroomClient conversations={allTeamUsersConversation} />;
}
