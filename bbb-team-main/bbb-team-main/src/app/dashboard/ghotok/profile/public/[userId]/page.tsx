import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import PublicUserProfileClient from "./publicUserProfileClient";
import { Role } from "@/types/Role";

export default async function UserPublicProfile({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  await checkRoleAndGetSession([Role.GHOTOK]);
  return <PublicUserProfileClient userId={userId} />;
}
