import TeamReportedUserClient from "./teamReportedUserClient";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import { getAllTeamReportedUsers } from "@/action/reported";

export default async function TeamReportedUsers() {
  await checkAuthAndGetSession(await headers());
  const reportedUsers = await getAllTeamReportedUsers();

  return <TeamReportedUserClient reports={reportedUsers} />;
}
