import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import React from "react";
import ConnectionRequestClient from "./connectionRequestClient";

export default async function ConnectionRequest() {
  await checkRoleAndGetSession([Role.GHOTOK]);
  return <ConnectionRequestClient />;
}
