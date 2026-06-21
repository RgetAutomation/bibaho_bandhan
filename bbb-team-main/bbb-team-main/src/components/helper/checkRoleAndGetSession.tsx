"server only";

import { redirect } from "next/navigation";
import { getLoggedInSession, ILoggedInUser, SessionType } from "./getSession";

export async function checkRoleAndGetSession(requiredRole?: string[]) {
  const session: ILoggedInUser | undefined = await getLoggedInSession(
    SessionType.USER
  );

  // Not signed in
  if (!session) {
    redirect("/auth/login");
  }

  // Signed in but wrong role
  if (requiredRole && !requiredRole.includes(session.role)) {
    redirect("/dashboard/unauthorized");
  }

  // Check if profile is complete
  if (!session.isProfileComplete) {
    redirect("/complete");
  }

  return session; // authorized
}
