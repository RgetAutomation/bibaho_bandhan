export const dynamic = "force-dynamic";

import { getAllReportedUsers } from "@/action/reported";
import ReportedUserClient from "./reportedUserClient";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function ReportedUsersPage() {
  await checkAuthAndGetSession(await headers());
  const reportedUsers = await getAllReportedUsers();

  return <ReportedUserClient reports={reportedUsers} />;
}
