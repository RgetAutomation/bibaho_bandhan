import React from "react";
import GhotokGroomsClientPage from "./userClientPage";
import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";

export default async function GhotokGrooms() {
  await checkRoleAndGetSession([Role.GHOTOK]);
  return <GhotokGroomsClientPage />;
}
