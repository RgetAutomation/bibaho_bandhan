import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import ReportUserClient from "./reportUserClient";

export default async function page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await checkRoleAndGetSession([Role.GHOTOK]);
  const { userId } = await params;
  return <ReportUserClient userId={userId} />;
}
