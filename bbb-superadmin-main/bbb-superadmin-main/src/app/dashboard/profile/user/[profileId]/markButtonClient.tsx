"use client";

import { Button } from "@/components/ui/button";
import { useProfileCopyStore } from "@/hooks/useProfileCopyStore";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function MarkButtonClient({ className }: { className?: string }) {
  const { isMarkingMode, toggleMarkingMode, reset } = useProfileCopyStore();
  const params = useParams();

  // Reset marking mode and selected fields when navigating to a new profile
  useEffect(() => {
    reset();
  }, [params.profileId, reset]);

  return (
    <Button
      variant={isMarkingMode ? "destructive" : "default"}
      className={`font-semibold shadow-md ${className || ""}`}
      onClick={toggleMarkingMode}
    >
      {isMarkingMode ? "Cancel Marking" : "Mark"}
    </Button>
  );
}
