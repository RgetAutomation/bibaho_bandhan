import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import ReportedSingleGroom from "./reportedSingleBride";
import { Role } from "@/types/Role";

export default async function ReportedPage({
  params,
}: {
  params: Promise<{ reportedId: string }>;
}) {
  await checkRoleAndGetSession([Role.GHOTOK]);
  const { reportedId } = await params;
  return <ReportedSingleGroom userId={reportedId} />;
}
