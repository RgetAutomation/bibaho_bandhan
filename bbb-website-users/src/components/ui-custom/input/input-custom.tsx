"use client";

import { useId, useRef } from "react";
import { CircleXIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

interface InputCustomProps<T extends FieldValues> {
  field: ControllerRenderProps<T, Path<T>>;
  placeholder: string;
  type: string;
  ariaInvalid: boolean;
}

export default function InputCustom<T extends FieldValues>({
  field,
  placeholder,
  type,
  ariaInvalid,
}: InputCustomProps<T>) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClearInput = () => {
    field.onChange("");
  };

  return (
    <div className="*:not-first:mt-2">
      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          className="pe-9"
          placeholder={placeholder}
          type={type}
          value={field.value ?? ""}
          onChange={field.onChange}
          aria-invalid={ariaInvalid}
        />
        {field.value && (
          <button
            className="cursor-pointer text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Clear input"
            onClick={handleClearInput}
          >
            <CircleXIcon size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
