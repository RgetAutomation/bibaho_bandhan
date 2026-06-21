"use client";

import { useOnlineStatus } from "@/components/useOnlineStatus";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { IconWorldOff } from "@tabler/icons-react";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InternetDetection({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isOnline = useOnlineStatus();
  return isOnline ? (
    <>{children}</>
  ) : (
    <div className="flex h-svh flex-1 items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconWorldOff />
          </EmptyMedia>
          <EmptyTitle>No internet connection</EmptyTitle>
          <EmptyDescription>
            Please check your internet connection and try again.
          </EmptyDescription>
        </EmptyHeader>
        <Button variant={"outline"} onClick={() => router.refresh()}>
          <RefreshCcw /> Retry
        </Button>
      </Empty>
    </div>
  );
}
