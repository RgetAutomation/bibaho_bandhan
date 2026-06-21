"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

interface CopyButtonProps {
  text: string;
  className?: string; // optional for styling
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 3000); // reset after 2s
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button
      type="button"
      variant={"ghost"}
      size={"icon"}
      onClick={handleCopy}
      className={`w-6 h-6 flex items-center gap-2 transition duration-500 ${className}`}
    >
      {copied ? (
        <Check className="text-green-500 w-3 h-3" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </Button>
  );
};
