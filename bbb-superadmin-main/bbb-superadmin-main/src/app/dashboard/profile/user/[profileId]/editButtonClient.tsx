"use client";

import { Button } from "@/components/ui/button";
import { useProfileEditStore } from "@/hooks/useProfileEditStore";
import { Pencil, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditButtonClient() {
  const { isEditingMode, toggleEditingMode, reset } = useProfileEditStore();
  const params = useParams();

  useEffect(() => {
    reset();
  }, [params.profileId, reset]);

  return (
    <Button
      variant={isEditingMode ? "destructive" : "outline"}
      size="sm"
      className="flex items-center gap-1.5 font-semibold shadow-md"
      onClick={toggleEditingMode}
    >
      {isEditingMode ? (
        <>
          <X className="h-3.5 w-3.5" />
          Cancel Edit
        </>
      ) : (
        <>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </>
      )}
    </Button>
  );
}
