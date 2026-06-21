import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import React from "react";
import MessageClientView from "./messageClientView";
import { getTeamUserMessageData } from "@/action/conversation";

export default async function MessageView({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { messageId } = await params;
  const message = await getTeamUserMessageData(messageId);
  return <MessageClientView message={message} />;
}
