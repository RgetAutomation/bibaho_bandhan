import { Loader2 } from "lucide-react";

export default function ButtonLoading({ text }: { text: string }) {
  return (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{text}</span>
    </>
  );
}
