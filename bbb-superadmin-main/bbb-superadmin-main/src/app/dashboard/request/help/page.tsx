import HelpClientPage from "./helpClient";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";

export default async function HelpRequestPage() {
  await checkAuthAndGetSession(await headers());
  return <HelpClientPage />;
}
