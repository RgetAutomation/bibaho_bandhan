import { cn } from "@/lib/utils";

interface FormBadgeProps {
  type: "mandatory" | "recommended" | "optional";
  className?: string;
}

export function FormBadge({ type, className }: FormBadgeProps) {
  if (type === "mandatory") {
    return (
      <span className={cn("inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#E51E44] text-white text-[8px] font-bold ml-1.5 align-middle", className)}>
        M
      </span>
    );
  }
  if (type === "recommended") {
    return (
      <span className={cn("inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-orange-500 text-white text-[8px] font-bold ml-1.5 align-middle", className)}>
        R
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-500 text-white text-[8px] font-bold ml-1.5 align-middle", className)}>
      O
    </span>
  );
}
