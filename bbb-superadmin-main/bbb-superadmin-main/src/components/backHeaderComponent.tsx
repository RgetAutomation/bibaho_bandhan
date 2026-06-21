"use client";

import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackHeaderComponent({
  title = "",
}: {
  title?: string;
}) {
  const router = useRouter();
  return (
    <div className="w-full border-b">
      <div className="flex items-center gap-4 p-4">
        <Button
          variant={"outline"}
          size={"icon"}
          className="rounded-full"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
    </div>
  );
}
