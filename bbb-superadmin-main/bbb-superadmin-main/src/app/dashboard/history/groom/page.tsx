export const dynamic = "force-dynamic";

import GroomChatHistoryClient from "./groomChatHistoryClient";
import { getAllGrooms } from "@/action/groom";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function BrideChatHistory({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sortBy?: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { page, q, sortBy } = await searchParams;
  const pageNumber = Number(page ?? 1);
  const query = q ?? "";
  const grooms = await getAllGrooms({
    search: query,
    page: pageNumber,
    limit: 9,
    sortBy: sortBy ?? "all",
  });

  return <GroomChatHistoryClient {...grooms} search={query} />;
}
