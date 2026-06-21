export const dynamic = "force-dynamic";

import React from "react";
import { TeamMemberClientComponent } from "./teamMemberClient";
import { getAllTeamMembers } from "@/action/teams";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function TeamMemberListPage() {
  await checkAuthAndGetSession(await headers());
  const teamMembers = await getAllTeamMembers();

  return (
    <div className="flex flex-1 flex-col">
      <TeamMemberClientComponent tms={teamMembers} />
    </div>
  );
}
