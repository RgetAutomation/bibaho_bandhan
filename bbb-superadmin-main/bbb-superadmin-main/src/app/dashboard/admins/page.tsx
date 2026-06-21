export const dynamic = "force-dynamic";

import { AdminClientComponent } from "./adminClient";
import { getAllAdmins } from "@/action/teams";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function AdminListPage() {
  await checkAuthAndGetSession(await headers());
  const admins = await getAllAdmins();

  return (
    <div className="flex flex-1 flex-col">
      <AdminClientComponent admins={admins} />
    </div>
  );
}
