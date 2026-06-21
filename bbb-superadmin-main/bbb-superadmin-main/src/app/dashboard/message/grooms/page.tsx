export const dynamic = "force-dynamic";

import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import GroomClientComponent from "./groomClient";

export default async function MessageGroomMain() {
  const user = await checkAuthAndGetSession(await headers());
  return <GroomClientComponent currentUserId={user.id} />;
}
