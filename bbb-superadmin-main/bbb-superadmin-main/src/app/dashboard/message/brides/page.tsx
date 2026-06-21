import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import BrideMessageClient from "./brideMessageClient";

export default async function BrideMessage() {
  const user = await checkAuthAndGetSession(await headers());
  return <BrideMessageClient currentUserId={user.id} />;
}
