export const dynamic = "force-dynamic";

import { getAllBrides } from "@/action/bride";
import React from "react";
import BrideChatHistoryClient from "./brideChatHistoryClient";
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
  const brides = await getAllBrides({
    search: query,
    page: pageNumber,
    limit: 9,
    sortBy: sortBy ?? "all",
  });

  return <BrideChatHistoryClient {...brides} search={query} />;
}
