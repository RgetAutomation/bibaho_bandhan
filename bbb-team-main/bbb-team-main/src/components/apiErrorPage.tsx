import React from "react";
import { Card, CardContent } from "./ui/card";
import { TriangleAlert } from "lucide-react";

export default function ApiErrorPage({
  title = "Failed to load data",
  description = "Something went wrong while loading data.",
}: {
  title?: string | null;
  description?: string | null;
}) {
  return (
    <div className="flex flex-1 min-h-screen md:min-h-min items-center justify-center px-4">
      <Card className="w-full bg-card max-w-md rounded-2xl shadow-md border border-destructive">
        <CardContent className="flex flex-col items-center justify-center text-center p-8 space-y-4">
          {/* Icon */}
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-700">
            <TriangleAlert className="h-8 w-8 text-red-600 dark:text-white" />
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-red-600">{title}</h2>

          {/* Message */}
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
