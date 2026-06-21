export const dynamic = "force-dynamic";

import { getAllSocialShareUser } from "@/action/users";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import SocialShareClient from "./socialShareClient";

export default async function SocialMediaSharePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sortBy?: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { page, q, sortBy } = await searchParams;
  const pageNumber = Number(page ?? 1);
  const query = q ?? "";
  const sortedBy = sortBy ?? "all";
  const users = await getAllSocialShareUser({
    search: query,
    page: pageNumber,
    limit: 9,
    sortBy: sortedBy,
  });
  return <SocialShareClient {...users} search={query} />;
}
