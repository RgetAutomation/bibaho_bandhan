import { Card, CardContent } from "@/components/ui/card";
import { FileSearch } from "lucide-react";

export default function ContentNotFound({
  title = "Content Not Found",
  description = "No data found in the server. Please try again later.",
}: {
  title?: string | null;
  description?: string | null;
}) {
  return (
    <Card className="w-full max-w-md rounded-2xl shadow-md border bg-card">
      <CardContent className="flex flex-col items-center justify-center text-center p-8 space-y-4">
        {/* Icon */}
        <div className="flex items-center justify-center h-16 w-16 rounded-full border bg-gray-200 dark:bg-gray-700">
          <FileSearch className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold ">{title}</h2>

        {/* Description */}
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
