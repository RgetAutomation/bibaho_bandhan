import ProfileViewClient from "./profileViewClient";
import { Role } from "@/types/Role";
import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";

export default async function ViewFullProfile({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await checkRoleAndGetSession([Role.GHOTOK]);
  const { userId } = await params;
  return <ProfileViewClient userId={userId} />;
}
