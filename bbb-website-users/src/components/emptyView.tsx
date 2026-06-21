import { Info } from "lucide-react";
import React from "react";

export function EmptyView({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-4 gap-2 text-center">
      <Info className="w-12 h-12 bg-card p-2 rounded-full" />
      <h1 className="text-lg md:text-xl lg:text-2xl">{title}</h1>
      <p>{description}</p>
    </div>
  );
}

export function EmptyViewCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3 text-center border shadow-lg rounded-2xl bg-card transition-all hover:scale-105 duration-500">
      {/* Icon Wrapper */}
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 shadow-sm">
        <Info className="w-8 h-8" />
      </div>

      {/* Title */}
      <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
        {title}
      </h1>

      {/* Description */}
      <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
        {description}
      </p>
    </div>
  );
}
