import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import GhotokUserChatClient from "./ghotokUserChatClient";

export default async function GhotokUserChatPage({
  params,
}: {
  params: Promise<{ convId: string }>;
}) {
  const ghotok = await checkRoleAndGetSession([Role.GHOTOK]);
  const { convId } = await params;
  return <GhotokUserChatClient convId={convId} ghotokId={ghotok.id} />;
}
