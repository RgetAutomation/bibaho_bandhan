import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import ProfileClient from "./profileClient";

export default async function ProfilePage() {
  const session = await checkAuthAndGetSession(await headers());
  return <ProfileClient user={session} />;
}
