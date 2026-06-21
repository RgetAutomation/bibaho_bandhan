import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import AdminChatClient from "./adminChatClient";
import { getAllAdminsForChat } from "@/action/teams";

export default async function MessageAdmins() {
  await checkAuthAndGetSession(await headers());
  const admins = await getAllAdminsForChat();
  return <AdminChatClient admins={admins} />;
}
