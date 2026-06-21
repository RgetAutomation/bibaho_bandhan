export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import CreateTemplateClient from "./createTemplateClient";

export default async function CreateTemplatePage() {
  await checkAuthAndGetSession(await headers());

  return (
    <div className="flex flex-1 flex-col p-5">
      <CreateTemplateClient />
    </div>
  );
}
