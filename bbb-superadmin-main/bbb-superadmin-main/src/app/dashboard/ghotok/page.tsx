export const dynamic = "force-dynamic";

import { GhotokClientComponent } from "./ghotokClient";
import { getAllGhotoks } from "@/action/teams";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function GhotokListPage() {
  await checkAuthAndGetSession(await headers());
  const ghotoks = await getAllGhotoks();

  return (
    <div className="flex flex-1 flex-col">
      <GhotokClientComponent ghotoks={ghotoks} />
    </div>
  );
}
