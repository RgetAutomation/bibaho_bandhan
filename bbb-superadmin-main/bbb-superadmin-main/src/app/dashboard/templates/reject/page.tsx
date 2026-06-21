export const dynamic = "force-dynamic";

import { getAllRejectMessageTemplates } from "@/action/templates";
import { EpmptyList } from "@/components/emptyList";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import Link from "next/link";
import RejectTemplateCardView from "./clientComponent";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function PlanPage() {
  await checkAuthAndGetSession(await headers());
  const templates = await getAllRejectMessageTemplates();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b p-2 md:p-4 lg:p-6">
        <h1 className="text-lg font-bold md:text-xl lg:text-2xl">
          Reject Approval Templates
        </h1>
        <Button asChild>
          <Link href="/dashboard/templates/reject/new">
            <PlusCircleIcon className="h-4 w-4" />
            <span>Create Template</span>
          </Link>
        </Button>
      </div>
      <div className="flex flex-1 flex-col">
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4">
            {templates.map((template) => (
              <RejectTemplateCardView key={template.id} {...template} />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-4">
            <EpmptyList
              title="No Template Found"
              subtitle="Please add some message template to get started."
            />
          </div>
        )}
      </div>
    </div>
  );
}
