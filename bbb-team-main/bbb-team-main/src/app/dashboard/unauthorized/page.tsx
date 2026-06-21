import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function UnauthorizedView() {
  return (
    <div className="w-full h-screen md:min-h-min flex flex-col flex-1 items-center justify-center px-4">
      <div className="shadow-lg rounded-2xl p-8 max-w-md w-full text-center bg-card border">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-sm text-muted-foreground mb-6">
          You don’t have the required permissions to view this page. <br />
          If you believe this is an error, please contact support.
        </p>
        <Button
          asChild
          className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
        >
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
