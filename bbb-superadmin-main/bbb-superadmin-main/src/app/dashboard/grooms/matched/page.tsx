import { getAllPaidMatchingGrooms } from "@/action/groom";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import PaidMatchingGroomClient from "./groomListClient";

export default async function PaidMatchingGroomPage() {
  await checkAuthAndGetSession(await headers());
  const grooms = await getAllPaidMatchingGrooms();
  return <PaidMatchingGroomClient grooms={grooms} />;
}
