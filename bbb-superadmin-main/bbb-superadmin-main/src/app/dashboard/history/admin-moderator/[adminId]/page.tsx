export const dynamic = "force-dynamic";

import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import { getAdminModeratorConversationByTeamId } from "@/action/conversation";
import SelectModeratorClient from "./selectModeratorClient";

export default async function SelectModerator({
  params,
}: {
  params: Promise<{ adminId: string }>;
}) {
  const { adminId } = await params;
  await checkAuthAndGetSession(await headers());
  const allTeamUsersConversation =
    await getAdminModeratorConversationByTeamId(adminId);
  return <SelectModeratorClient conversations={allTeamUsersConversation} />;
}
