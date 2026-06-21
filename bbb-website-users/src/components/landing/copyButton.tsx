"use client";

import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";

export default function CopyButton({
  size = "sm",
  text,
}: {
  size?: "sm" | "default" | "lg" | "icon";
  text: string;
}) {
  return (
    <Button
      variant={"outline"}
      size={size}
      className="rounded-full"
      onClick={() => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
      }}
    >
      <Copy className="w-4 h-4" />
      <span>Copy</span>
    </Button>
  );
}
