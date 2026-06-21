export const dynamic = "force-dynamic";

import { getProfileRequestById } from "@/action/request";
import { ProfileStatusCard } from "./profileDetailsClient";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function ProfileRequestDetailsPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { profileId } = await params;
  const profile = await getProfileRequestById(profileId);

  if (!profile) return null;

  return <ProfileStatusCard data={profile} />;
}
