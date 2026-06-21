import { Loader2 } from "lucide-react";
import React from "react";

export default function SubmitLoadingView({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{text}</span>
    </div>
  );
}
