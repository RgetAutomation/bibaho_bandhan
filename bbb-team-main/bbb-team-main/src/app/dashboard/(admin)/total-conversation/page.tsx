import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import React from "react";
import TotalConversationClientComponent from "./totalConversationClient";

export default async function TotalConversationPage() {
  await checkRoleAndGetSession([Role.ADMIN]);
  return <TotalConversationClientComponent />;
}
