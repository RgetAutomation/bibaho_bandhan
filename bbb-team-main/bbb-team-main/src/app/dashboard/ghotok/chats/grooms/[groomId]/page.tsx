import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import GroomAllConversationClient from "./groomConvClient";

export default async function AllGroomsForChat({
  params,
}: {
  params: Promise<{ groomId: string }>;
}) {
  await checkRoleAndGetSession([Role.GHOTOK]);
  const { groomId } = await params;
  return <GroomAllConversationClient groomId={groomId} />;
}
