import { useId } from "react";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

interface InputEmailProps<T extends FieldValues> {
  field: ControllerRenderProps<T, Path<T>>;
  areaInvalid: boolean;
  placeholder: string;
}

export default function InputEmail<T extends FieldValues>({
  field,
  areaInvalid,
  placeholder,
}: InputEmailProps<T>) {
  const id = useId();
  return (
    <div className="*:not-first:mt-2">
      <div className="relative">
        <Input
          id={id}
          className="peer ps-9"
          placeholder={placeholder}
          type="email"
          aria-invalid={areaInvalid}
          {...field}
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <Mail size={16} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
