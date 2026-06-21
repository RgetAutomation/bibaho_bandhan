export const dynamic = "force-dynamic";

import { getProfileRequests } from "@/action/request";
import { EpmptyList } from "@/components/emptyList";
import React from "react";
import { ProfileClientComponent } from "./profileClient";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function ProfileRequestPage() {
  await checkAuthAndGetSession(await headers());
  const teams = await getProfileRequests();

  return (
    <div className="flex flex-1 flex-col">
      {teams.length > 0 ? (
        <ProfileClientComponent teams={teams} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <EpmptyList
            title="No User Found"
            subtitle="We could not find any user to show here."
          />
        </div>
      )}
    </div>
  );
}
