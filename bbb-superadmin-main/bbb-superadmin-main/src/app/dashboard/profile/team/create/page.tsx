export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import CreateTeamClient from "./createTeamClient";

export default async function TeamCreatePage() {
  await checkAuthAndGetSession(await headers());
  return <CreateTeamClient />;
}
