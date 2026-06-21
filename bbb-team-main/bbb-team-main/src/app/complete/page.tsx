import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import {
  getLoggedInSession,
  ILoggedInUser,
  SessionType,
} from "@/components/helper/getSession";
import ProfileCompleteClient from "./profileCompleteClient";
import Link from "next/link";

export default async function CompleteProfile() {
  const user: ILoggedInUser | undefined = await getLoggedInSession(
    SessionType.USER
  );
  const userId = user?.id;
  const isComplete = user?.isProfileComplete;

  if (isComplete) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center md:min-h-min">
        <div className="bg-card flex max-w-md flex-col items-center justify-center gap-4 rounded-2xl border p-5 shadow-lg">
          <div className="flex items-center justify-center rounded-full border bg-green-600/10 p-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Profile Completed</h1>
          <p className="text-muted-foreground text-center">
            Your profile has been completed successfully. You can now start
            using the app.
          </p>
          <Button className="rounded-full p-5" asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <ProfileCompleteClient userId={userId ?? ""} />;
}
