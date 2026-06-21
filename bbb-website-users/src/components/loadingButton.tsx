import { Loader2 } from "lucide-react";

export function LoadingButton({ title }: { title: string }) {
  return (
    <>
      <Loader2 className="animate-spin" />
      {title && <span>{title}</span>}
    </>
  );
}
