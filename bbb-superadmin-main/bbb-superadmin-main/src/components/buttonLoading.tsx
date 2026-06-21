import { Loader2 } from "lucide-react";
import React from "react";

export default function ButtonLoading({ text }: { text: string }) {
  return (
    <>
      <Loader2 className="animate-spin" />
      <span>{text}</span>
    </>
  );
}
