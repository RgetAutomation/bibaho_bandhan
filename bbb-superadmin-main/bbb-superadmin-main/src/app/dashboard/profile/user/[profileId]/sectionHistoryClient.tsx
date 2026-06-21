"use client";

import { useState } from "react";
import { ProfileEditHistoryItem } from "@/action/adminProfileEdit";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  history: ProfileEditHistoryItem[];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function SectionHistory({ history }: Props) {
  const [open, setOpen] = useState(false);

  if (!history || history.length === 0) return null;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs h-8 px-3"
        onClick={() => setOpen((o) => !o)}
      >
        <Clock className="h-3.5 w-3.5" />
        {history.length} edit{history.length > 1 ? "s" : ""} in history
        {open ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[320px] sm:w-[400px] z-50 flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-xl max-h-[400px] overflow-y-auto">
          {history.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border bg-muted/30 p-3 text-xs"
            >
              <p className="text-muted-foreground mb-2 flex items-center gap-1 font-medium">
                <Clock className="h-3 w-3" />
                {formatDate(item.updatedAt)}
              </p>
              <div className="flex flex-col gap-1.5">
                {Object.entries(item.previousData).map(([key, val]) => (
                  <div key={key} className="flex gap-2 items-start">
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px] min-w-[100px] pt-0.5">
                      {key}:
                    </span>
                    <span className="text-foreground font-medium break-all bg-muted/50 px-2 py-0.5 rounded flex-1">
                      {val === null || val === undefined || val === ""
                        ? <span className="italic text-muted-foreground">—</span>
                        : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
