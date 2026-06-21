export const dynamic = "force-dynamic";

import { EpmptyList } from "@/components/emptyList";
import React from "react";
import EditMessageTemplateClientComponent from "./clientComponent";
import { getMessageTemplateById } from "@/action/templates";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function EditMessageTemplate({
  params,
}: {
  params: Promise<{ tempId: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { tempId } = await params;
  const template = await getMessageTemplateById(tempId);

  if (!tempId || !template)
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <EpmptyList
          title="No Message Template Found"
          subtitle="Please add some message template to get started."
        />
      </div>
    );

  return <EditMessageTemplateClientComponent {...template} />;
}
