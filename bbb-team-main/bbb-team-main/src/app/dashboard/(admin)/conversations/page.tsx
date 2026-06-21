import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import React from "react";
import ConversationClientComponents from "./conversationClient";

export default async function ConversationsPage() {
  await checkRoleAndGetSession([Role.ADMIN]);
  return <ConversationClientComponents />;
}
