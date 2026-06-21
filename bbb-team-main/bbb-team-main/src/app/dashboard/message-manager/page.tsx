import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import React from "react";
import MessageManagerClientPage from "./messageManagerClient";

export default async function MessageToManager() {
  const user = await checkRoleAndGetSession([
    Role.ADMIN,
    Role.MODERATOR,
    Role.GHOTOK,
  ]);
  return (
    <MessageManagerClientPage userId={user.id} userRole={user.role as Role} />
  );
}
