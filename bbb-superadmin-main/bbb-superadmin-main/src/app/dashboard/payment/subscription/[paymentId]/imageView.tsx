"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function ScreenshotImageView({
  imageUrl,
}: {
  imageUrl: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center cursor-pointer justify-center rounded-md border border-muted-foreground/20 p-1 hover:ring-2 hover:ring-ring focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="View full screenshot"
        >
          <div className="relative size-24">
            <Image
              src={imageUrl}
              alt="User uploaded screenshot"
              fill
              className="object-cover rounded-md"
            />
          </div>
        </button>
      </DialogTrigger>

      {/* Dialog */}
      <DialogContent className="max-w-3xl p-0 bg-background">
        <DialogHeader className="flex justify-between items-center p-3 border-b">
          <DialogTitle className="text-lg font-semibold">
            Screenshot Preview
          </DialogTitle>
        </DialogHeader>

        {/* Full image with zoom */}
        <div className="flex justify-center items-center bg-muted p-4 max-h-[80vh] overflow-auto">
          <Image
            src={imageUrl}
            alt="Full size user screenshot"
            width={1000}
            height={1000}
            className="object-contain max-h-[75vh] w-auto h-auto"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
