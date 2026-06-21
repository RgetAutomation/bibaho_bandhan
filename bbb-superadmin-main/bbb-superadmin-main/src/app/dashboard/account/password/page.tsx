import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import ChangePasswordClient from "./changePasswordClient";
import { headers } from "next/headers";

export default async function ChangePasswordPage() {
  await checkAuthAndGetSession(await headers());
  return <ChangePasswordClient />;
}
