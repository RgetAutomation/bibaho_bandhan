import { getAllGhotoksForChat } from "@/action/teams";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import GhotokChatClient from "./ghotokChatClient";

export default async function MessageGhotokPage() {
  await checkAuthAndGetSession(await headers());
  const ghotoks = await getAllGhotoksForChat();
  return <GhotokChatClient ghotoks={ghotoks} />;
}
