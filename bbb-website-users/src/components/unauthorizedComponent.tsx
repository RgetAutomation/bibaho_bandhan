import Link from "next/link";
import DashboardHeader from "./dashboard/header";
import { Button } from "./ui/button";

export default function UnauthorizedComponent() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/50 to-background">
      {/* Page Header */}
      <DashboardHeader title="Unauthorized" mainPage={false} />

      {/* Content */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="flex flex-col gap-5 p-6 sm:p-8 bg-card rounded-2xl shadow-2xl border max-w-md w-full text-center animate-in fade-in-50">
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 text-primary text-3xl">
              🚀
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Upgrade Required</h1>
          </div>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            You&apos;re currently on the free plan. Unlock premium features and
            complete your profile by upgrading.
          </p>

          <Button
            asChild
            size="lg"
            className="mt-2 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Link href="/users/plan">Upgrade Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
