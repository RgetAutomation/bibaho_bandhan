import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function FeedbackThanksPage() {
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
          Your Feedback Means a Lot to Us
        </h1>

        <p className="text-center text-muted-foreground">
          We have received your feedback successfully. Your valuable suggestions
          help us make Bangali Bibaho Bandhan better for everyone. Thank you for
          your trust and support.
        </p>

        <Button
          asChild
          className={"rounded-full mt-5"}
          variant={"default"}
          size={"lg"}
        >
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
