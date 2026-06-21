export const dynamic = "force-dynamic";

import { getAllAdmins } from "@/action/teams";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import AdminModeratorClient from "./adminModeratorClient";

export default async function AdminModeratorChatHistoryPage() {
  await checkAuthAndGetSession(await headers());
  const admins = await getAllAdmins();
  return <AdminModeratorClient admins={admins} />;
}
