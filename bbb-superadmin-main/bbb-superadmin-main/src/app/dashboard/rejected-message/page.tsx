import { getAllRejectedMessages } from "@/action/teams";
import RejectedMessageClient from "./rejectedMessageClient";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";

export default async function RejectedMessagePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { page } = await searchParams;
  const pageNumber = Number(page ?? 1);
  const rejectedMessage = await getAllRejectedMessages({
    page: pageNumber,
    limit: 9,
  });
  return <RejectedMessageClient {...rejectedMessage} />;
}
