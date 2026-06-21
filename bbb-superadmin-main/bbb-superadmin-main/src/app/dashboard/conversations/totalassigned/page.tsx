import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import TotalAssignedConvClient from "./totalAssignedConvClient";
import { getTotalAssignedConversationsLog } from "@/action/conversation";

export default async function TotalAssignedPage({
  searchParams,
}: {
  searchParams: Promise<{ page: string; days: string }>;
}) {
  const user = await checkAuthAndGetSession(await headers());
  const { page, days } = await searchParams;
  const pageNumber = Number(page ?? 1);
  const daysNumber = Number(days ?? 7);
  const data = await getTotalAssignedConversationsLog({
    page: pageNumber,
    limit: 6,
    days: daysNumber,
  });
  return (
    <TotalAssignedConvClient
      saUserId={user.id as string}
      saUserAvatar={user.image as string}
      data={data}
      currentPage={pageNumber}
    />
  );
}
