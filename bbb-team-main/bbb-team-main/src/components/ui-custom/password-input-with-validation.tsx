"use client";

import { useId, useMemo, useState } from "react";
import { EyeIcon, EyeOffIcon, CheckIcon, XIcon, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

interface PasswordInputProps<T extends FieldValues> {
  field: ControllerRenderProps<T, Path<T>>;
  placeholder: string;
  isIcon?: boolean;
  ariaInvalid?: boolean;
}

export default function PasswordInput<T extends FieldValues>({
  field,
  placeholder,
  isIcon = false,
  ariaInvalid,
}: PasswordInputProps<T>) {
  const id = useId();
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  const checkStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
      {
        regex: /[$&+,:;=?@#|'<>.^*()%!-]/,
        text: "At least 1 special character",
      },
    ];
    return requirements.map((r) => ({
      text: r.text,
      met: r.regex.test(pass),
    }));
  };

  const strength = useMemo(
    () => checkStrength(field.value || ""),
    [field.value]
  );
  const strengthScore = useMemo(
    () => strength.filter((r) => r.met).length,
    [strength]
  );

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-border";
    if (score <= 2) return "bg-red-500";
    if (score === 3) return "bg-orange-500";
    if (score === 4) return "bg-amber-500";
    return "bg-emerald-500"; // only when all 5 met
  };

  const getStrengthText = (score: number) => {
    if (score === 0) return "Enter a password";
    if (score <= 2) return "Weak password";
    if (score === 3) return "Medium password";
    if (score === 4) return "Almost strong, add special character";
    return "Strong password"; // only when all 5 met
  };

  return (
    <div>
      <div className="*:not-first:mt-2">
        <div className="relative">
          <Input
            id={id}
            className={`pe-9 ${isIcon ? "pl-9" : ""}`}
            type={isVisible ? "text" : "password"}
            placeholder={placeholder}
            value={field.value || ""}
            onChange={field.onChange}
            onBlur={() => {
              field.onBlur();
              setIsFocused(false);
            }}
            onFocus={() => setIsFocused(true)}
            name={field.name}
            ref={field.ref}
            aria-describedby={`${id}-description`}
            aria-invalid={ariaInvalid}
          />

          {/* Left Icon */}
          {isIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center ps-3 pointer-events-none text-muted-foreground/80">
              <KeyRound size={16} aria-hidden="true" />
            </div>
          )}
          <button
            type="button"
            onClick={toggleVisibility}
            className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px]"
            aria-label={isVisible ? "Hide password" : "Show password"}
            aria-pressed={isVisible}
          >
            {isVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        </div>
      </div>

      {isFocused && (
        <>
          {/* Always show strength bar while focused */}
          <div
            className="bg-border mt-3 mb-4 h-1 w-full overflow-hidden rounded-full"
            role="progressbar"
            aria-valuenow={strengthScore}
            aria-valuemin={0}
            aria-valuemax={5}
            aria-label="Password strength"
          >
            <div
              className={`h-full ${getStrengthColor(
                strengthScore
              )} transition-all duration-500 ease-out`}
              style={{ width: `${(strengthScore / 5) * 100}%` }}
            ></div>
          </div>

          {/* Only show requirements until all are met */}
          {strengthScore < 5 && (
            <>
              <p
                id={`${id}-description`}
                className="text-foreground mb-2 text-sm font-medium"
              >
                {getStrengthText(strengthScore)}. Must contain:
              </p>

              <ul className="space-y-1.5" aria-label="Password requirements">
                {strength.map((r, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {r.met ? (
                      <CheckIcon size={16} className="text-emerald-500" />
                    ) : (
                      <XIcon size={16} className="text-muted-foreground/80" />
                    )}
                    <span
                      className={`text-xs ${
                        r.met ? "text-emerald-600" : "text-muted-foreground"
                      }`}
                    >
                      {r.text}
                      <span className="sr-only">
                        {r.met
                          ? " - Requirement met"
                          : " - Requirement not met"}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
