export const dynamic = "force-dynamic";

import { getAllLoggedInSessions } from "@/action/sessions";
import { EpmptyList } from "@/components/emptyList";
import LoginSessionClient from "./loginSessionClient";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function SessionPage() {
  await checkAuthAndGetSession(await headers());

  const allSessions = await getAllLoggedInSessions();
  return (
    <div className="flex flex-1 flex-col">
      {allSessions.length > 0 ? (
        <LoginSessionClient sessions={allSessions} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <EpmptyList
            title="No Session Found"
            subtitle="We could not find any user session to show here."
          />
        </div>
      )}
    </div>
  );
}
