import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function HelpTicketCreatedSuccessPage() {
  return (
    <div className={"flex flex-col items-center justify-center flex-1 p-6"}>
      <div
        className={
          "flex flex-col items-center justify-center border rounded-2xl shadow-md bg-card p-5 max-w-md lg:max-w-lg gap-3"
        }
      >
        <div
          className={
            "flex items-center justify-center bg-green-800/20 p-4 rounded-full"
          }
        >
          <CheckCircle2 className="text-green-500 size-14" />
        </div>
        <h1 className={"text-xl lg:text-2xl font-semibold text-center"}>
          Help Ticket Created Successfully
        </h1>
        <p className="text-center text-muted-foreground">
          Your help ticket has been successfully created. Please be patient as
          we will get back to you as soon as possible. Thank you for your
          patience.
        </p>

        <Button
          asChild
          className={"rounded-full mt-5"}
          variant={"default"}
          size={"lg"}
        >
          <Link href="/helpcenter/search">View Status</Link>
        </Button>
      </div>
    </div>
  );
}
