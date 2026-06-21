export const dynamic = "force-dynamic";

import { getAllGhotoks } from "@/action/teams";
import GhotokReviewClient from "./ghotokReviewClient";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function GhotokReviewsPage() {
  await checkAuthAndGetSession(await headers());
  const allGhotoks = await getAllGhotoks();

  return <GhotokReviewClient ghotoks={allGhotoks} />;
}
