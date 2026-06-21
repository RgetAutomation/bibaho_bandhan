import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import BroadcastClient from "./broadcastClient";

export default async function BroadcastPage() {
  await checkAuthAndGetSession(await headers());

  return <BroadcastClient />;
}
