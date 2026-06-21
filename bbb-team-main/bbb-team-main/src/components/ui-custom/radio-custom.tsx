import { useId } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import { FormControl, FormItem, FormLabel } from "../ui/form";
import { LucideIcon } from "lucide-react";

interface RadioOption {
  value: string;
  label: string;
  icon: LucideIcon;
  textColor?: string;
}

interface RadioCustomProps<T extends FieldValues> {
  field: ControllerRenderProps<T, Path<T>>;
  items: RadioOption[];
}

export default function RadioCustom<T extends FieldValues>({
  field,
  items,
}: RadioCustomProps<T>) {
  const id = useId();

  // const items = [
  //   {
  //     value: "MALE",
  //     label: "Male",
  //     Icon: Mars,
  //     textColor: "text-blue-400",
  //   },
  //   {
  //     value: "FEMALE",
  //     label: "Female",
  //     Icon: Venus,
  //     textColor: "text-pink-400",
  //   },
  // ];

  return (
    <RadioGroup
      className="grid-cols-2"
      onValueChange={field.onChange}
      defaultValue={field.value}
    >
      {items.map((item) => (
        <FormItem
          key={`${id}-${item.value}`}
          className={cn(
            item.value === "MALE"
              ? "has-data-[state=checked]:border-blue-500/50 has-data-[state=checked]:bg-blue-100/50 dark:has-data-[state=checked]:bg-blue-300/10"
              : "has-data-[state=checked]:border-pink-500/50 has-data-[state=checked]:bg-pink-100/50 dark:has-data-[state=checked]:bg-pink-300/10",
            "border-input relative flex flex-col gap-4 rounded-md border p-4 shadow-xs outline-none"
          )}
        >
          <FormControl>
            <div className="flex justify-between gap-2">
              <RadioGroupItem
                id={`${id}-${item.value}`}
                value={item.value}
                className={cn(
                  item.textColor,
                  item.value === "MALE"
                    ? "data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500/50"
                    : "data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500/50",
                  "order-1 after:absolute after:inset-0"
                )}
              />
              <item.icon
                className={cn("size-5", item.textColor)}
                size={16}
                aria-hidden="true"
              />
            </div>
          </FormControl>
          <FormLabel
            htmlFor={`${id}-${item.value}`}
            className={cn("cursor-pointer", item.textColor)}
          >
            {item.label}
          </FormLabel>
        </FormItem>
      ))}
    </RadioGroup>
  );
}
