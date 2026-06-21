import { getSession } from "next-auth/react";

export async function forceRehydrateSession() {
  // Ping the rehydrate endpoint to ensure token is refreshed
  await fetch("/api/auth/rehydrate");
  // Then ask next-auth to re-fetch the session client-side
  await getSession();
}

export default forceRehydrateSession;
