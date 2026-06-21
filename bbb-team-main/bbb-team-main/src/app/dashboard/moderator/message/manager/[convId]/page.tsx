import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { ILoggedInUser } from "@/components/helper/getSession";
import { Role } from "@/types/Role";
import React from "react";
import ChatClientPage from "./chatClientPage";

export default async function ChatWithAdminPage({
  params,
}: {
  params: Promise<{ convId: string }>;
}) {
  const user: ILoggedInUser | null = await checkRoleAndGetSession([
    Role.MODERATOR,
  ]);
  const { convId: conversationId } = await params;
  return (
    <ChatClientPage
      conversationId={conversationId}
      currentUserId={user.id as string}
    />
  );
}
