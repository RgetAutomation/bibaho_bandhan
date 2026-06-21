export const dynamic = "force-dynamic";

import { getAllAdmins } from "@/action/teams";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import AdminGroomClient from "./adminGroomClient";

export default async function AdminGroomChatHistoryPage() {
  await checkAuthAndGetSession(await headers());
  const admins = await getAllAdmins();
  return <AdminGroomClient admins={admins} />;
}
