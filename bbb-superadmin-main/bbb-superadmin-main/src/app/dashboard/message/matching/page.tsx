import React from "react";
import MatchedChatGroomClient from "./matchedChatGroomClient";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import { getAllGroomsForChat } from "@/action/users";

export default async function ChatMatchedGroom() {
  const user = await checkAuthAndGetSession(await headers());
  const grooms = await getAllGroomsForChat();
  return <MatchedChatGroomClient currentUserId={user.id} grooms={grooms} />;
}
