"server only";

import { auth } from "@/lib/auth";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { redirect } from "next/navigation";
import { UserRole } from "../enum/userRole";

export async function checkAuthAndGetSession(header: ReadonlyHeaders) {
  const session = await auth.api.getSession({
    headers: header,
  });

  // Signed in
  if (session?.user.role !== UserRole.SUPERADMIN) {
    redirect("/dashboard/unauthorized");
  }

  // Not signed in
  if (!session) {
    redirect("/auth/login");
  }

  return session.user; // authorized
}
