import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import React from "react";
import GhotokBridesClientPage from "./userClientPage";

export default async function GhotokBrides() {
  await checkRoleAndGetSession([Role.GHOTOK]);
  return <GhotokBridesClientPage />;
}
