export const dynamic = "force-dynamic";

import { getGhotokJoinRequest } from "@/action/request";
import JoinClientComponent from "./joinClient";
import { EpmptyList } from "@/components/emptyList";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function GhotokJoinRequest() {
  await checkAuthAndGetSession(await headers());
  const ghotoks = await getGhotokJoinRequest();

  return (
    <div className="flex flex-1 flex-col">
      {ghotoks.length > 0 ? (
        <JoinClientComponent ghotoks={ghotoks} />
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
