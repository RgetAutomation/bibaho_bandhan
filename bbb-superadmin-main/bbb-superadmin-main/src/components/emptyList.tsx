import { Info } from "lucide-react";
import React from "react";

export function EpmptyList({
  title = "No Data Found",
  subtitle = "Please add some data to get started.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-4 gap-2 text-center">
      <Info className="w-12 h-12 bg-card p-2 rounded-full" />
      <h1 className="text-lg md:text-xl lg:text-2xl">{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
