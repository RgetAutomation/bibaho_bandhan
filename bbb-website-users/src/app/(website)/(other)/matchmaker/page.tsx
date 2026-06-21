import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";
import MatchmakerClientPage from "./matchmakerClientPage";

export const metadata: Metadata = {
  title: "Join Matchmaker",
  description:
    "Become a trusted matchmaker and help others find their perfect life partner.",
};

export default function MatchmakerPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-10">
      <div className="md:max-w-md flex flex-col border border-border shadow-md rounded-2xl p-8 w-full max-w-lg bg-card gap-4">
        {/* Title */}
        <h1 className="text-2xl font-semibold tracking-tight text-center">
          Join Us as a Matchmaker
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          Fill in your details and our team will get in touch with you soon.
        </p>

        {/* Form */}
        <MatchmakerClientPage />
      </div>

      {/* Right Side */}
      <div className="flex flex-1 items-center justify-center gap-2 mt-5">
        <span>You already submitted a request?</span>
        <Button asChild variant={"outline"} className="rounded-full">
          <Link href="/matchmaker/search">View Status</Link>
        </Button>
      </div>
    </div>
  );
}
