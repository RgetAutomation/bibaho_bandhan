import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import React from "react";
import MatchingClientComponent from "./matchingClient";

export default async function MatchingRoomPage() {
  await checkRoleAndGetSession([Role.ADMIN]);
  return <MatchingClientComponent />;
}
