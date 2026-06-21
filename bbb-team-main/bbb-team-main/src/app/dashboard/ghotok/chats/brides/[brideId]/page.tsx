import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import BrideAllConversationClient from "./brideConvClient";

export default async function AllBridesForChat({
  params,
}: {
  params: Promise<{ brideId: string }>;
}) {
  await checkRoleAndGetSession([Role.GHOTOK]);
  const { brideId } = await params;
  return <BrideAllConversationClient brideId={brideId} />;
}
