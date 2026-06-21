import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function ProfileCompletedComponent() {
  return (
    <div className="flex flex-col items-center justify-center text-center flex-1 px-4 py-8">
      <div className="bg-card border shadow-sm rounded-2xl px-6 py-8 w-full max-w-md">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-white rounded-full p-3 border border-green-600 dark:border-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold">Profile Completed</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Your profile is already complete. You&apos;re all set to explore!
          </p>

          <Button asChild className={"rounded-full"}>
            <Link href="/users/account">Back to Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
