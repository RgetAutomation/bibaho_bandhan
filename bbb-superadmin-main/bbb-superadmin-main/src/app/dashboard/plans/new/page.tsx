export const dynamic = "force-dynamic";

import CreatePlanClient from "./createPlanClient";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function CreatePlanPage() {
  await checkAuthAndGetSession(await headers());
  return (
    <div className="flex flex-1 flex-col p-5">
      <CreatePlanClient />
    </div>
  );
}
