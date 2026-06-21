export const dynamic = "force-dynamic";

import { getAllGrooms } from "@/action/groom";
import GroomListClient from "./groomListClient";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function GroomListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sortBy?: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { page, q, sortBy } = await searchParams;
  const pageNumber = Number(page ?? 1);
  const query = q ?? "";
  const sortedBy = sortBy ?? "all";
  const grooms = await getAllGrooms({
    search: query,
    page: pageNumber,
    limit: 9,
    sortBy: sortedBy,
  });

  return <GroomListClient {...grooms} search={query} />;
}
