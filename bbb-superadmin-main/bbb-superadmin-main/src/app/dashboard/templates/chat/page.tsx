export const dynamic = "force-dynamic";

import { getAllMessageTemplates } from "@/action/templates";
import { EpmptyList } from "@/components/emptyList";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import Link from "next/link";
import TemplateCardView from "./clientComponent";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function ChatTemplatePage() {
  await checkAuthAndGetSession(await headers());
  const templates = await getAllMessageTemplates();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b p-2 md:p-4 lg:p-6">
        <h1 className="text-lg font-bold md:text-xl lg:text-2xl">
          Message Templates
        </h1>
        <Button asChild>
          <Link href="/dashboard/templates/chat/new">
            <PlusCircleIcon className="h-4 w-4" />
            <span>Create Template</span>
          </Link>
        </Button>
      </div>
      <div className="flex flex-1 flex-col">
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4">
            {templates.map((template) => (
              <TemplateCardView key={template.id} {...template} />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-4">
            <EpmptyList
              title="No Message Template Found"
              subtitle="Please add some message template to get started."
            />
          </div>
        )}
      </div>
    </div>
  );
}
