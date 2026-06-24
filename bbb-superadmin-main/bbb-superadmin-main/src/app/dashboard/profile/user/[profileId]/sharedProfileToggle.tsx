"use client";

import { Share2 } from "lucide-react";

export default function SharedProfileToggle({ userId, initialValue = false }: { userId: string, initialValue?: boolean }) {
  return (
    <div className="flex items-center gap-2 ml-2">
      <button
        type="button"
        className="flex items-center gap-1.5 cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Mark Shared
      </button>
    </div>
  );
}
