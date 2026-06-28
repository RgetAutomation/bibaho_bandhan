"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function ImageViewClient({
  id,
  image,
  canDelete,
}: {
  id: string;
  image: string;
  canDelete: boolean;
}) {
  const [onDownload, setOnDownload] = useState<string | null>("");

  const getFileNameFromUrl = (url: string) => {
    try {
      const lastSegment = decodeURIComponent(
        url.split("/").pop()?.split("?")[0] || ""
      );

      const ext = lastSegment.includes(".")
        ? lastSegment.substring(lastSegment.lastIndexOf(".") + 1)
        : "jpg";

      const now = new Date();
      const dateTime =
        [
          now.getFullYear(),
          String(now.getMonth() + 1).padStart(2, "0"),
          String(now.getDate()).padStart(2, "0"),
        ].join("") +
        "_" +
        [
          String(now.getHours()).padStart(2, "0"),
          String(now.getMinutes()).padStart(2, "0"),
          String(now.getSeconds()).padStart(2, "0"),
        ].join("");

      return `bbb_image_${dateTime}.${ext}`;
    } catch {
      return `bbb_image_${Date.now()}.jpg`;
    }
  };

  const handleImageDownload = async (id: string, url: string) => {
    setOnDownload(id);
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = getFileNameFromUrl(url); // change name if needed
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(objectUrl);
      setOnDownload(null);
    } catch (error) {
      console.error("Image download failed", error);
      setOnDownload(null);
    }
  };

  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl border bg-neutral-200 p-4 dark:bg-neutral-800">
      {image ? (
        <Image
          width={200}
          height={200}
          src={image}
          alt="profile"
          className="h-auto w-full rounded-md"
        />
      ) : (
        <div className="w-full aspect-square rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
          No Image
        </div>
      )}
      <div
        className={cn("mt-auto grid gap-2", canDelete ? "grid-cols-2" : "grid-cols-1")}
      >
        {canDelete && (
          <Button
            variant={"outline"}
            className="rounded-full border border-red-500 text-red-500"
          >
            <Trash2 /> Delete
          </Button>
        )}
        <Button
          className="rounded-full"
          onClick={() => handleImageDownload(id, image)}
          disabled={onDownload === id}
          variant={"outline"}
        >
          {onDownload === id ? (
            <>
              <Loader2 className="animate-spin" /> Downloading
            </>
          ) : (
            <>
              <Download /> Downlaod
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
