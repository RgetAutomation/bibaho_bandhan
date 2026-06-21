"use client";

import { ChevronLeftIcon } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export interface DashboardHeaderProps {
  title: React.ReactNode;
  mainPage?: boolean;
  backLink?: string;
}

export default function DashboardHeader({
  title,
  mainPage,
  backLink,
}: DashboardHeaderProps) {
  const router = useRouter();

  function handleBack() {
    if (backLink) return router.push(backLink);
    router.back();
  }

  return (
    <div className="w-full flex flex-col border-b border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-center gap-2 relative">
        {!mainPage && (
          <Button
            variant={"default"}
            size={"icon"}
            className="absolute left-4 rounded-full"
            onClick={handleBack}
          >
            <ChevronLeftIcon className="size-5 mr-0.5" />
          </Button>
        )}
        {title}
      </div>
    </div>
  );
}
