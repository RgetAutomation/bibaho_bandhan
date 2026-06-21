import { useId } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Angry, Frown, Laugh, Meh, Smile } from "lucide-react";
import { FormControl, FormItem } from "../ui/form";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

interface RadioCustomProps<T extends FieldValues> {
  field: ControllerRenderProps<T, Path<T>>;
}

export default function FeedbackRadioComponent<T extends FieldValues>({
  field,
}: RadioCustomProps<T>) {
  const id = useId();
  return (
    <RadioGroup
      className="grid-cols-5 gap-1 md:gap-2 lg:gap-3"
      onValueChange={field.onChange}
      defaultValue={field.value}
    >
      <FormItem className="border-input has-data-[state=checked]:border-green-500/90 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex cursor-pointer flex-col items-center gap-3 rounded-md border px-2 py-3 text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]">
        <FormControl>
          <div className="flex flex-col items-center justify-center gap-2">
            <RadioGroupItem id={`${id}-5`} value="5" className="sr-only" />
            <Laugh className="text-green-500" size={25} aria-hidden="true" />
            <label
              htmlFor={`${id}-5`}
              className="text-green-500 cursor-pointer text-xs leading-none font-medium after:absolute after:inset-0"
            >
              Excellence
            </label>
          </div>
        </FormControl>
      </FormItem>

      <FormItem className="border-input has-data-[state=checked]:border-lime-500/90 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex cursor-pointer flex-col items-center gap-3 rounded-md border px-2 py-3 text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]">
        <FormControl>
          <div className="flex flex-col items-center justify-center gap-2">
            <RadioGroupItem id={`${id}-4`} value="4" className="sr-only" />
            <Smile className="text-lime-500" size={25} aria-hidden="true" />
            <label
              htmlFor={`${id}-4`}
              className="text-lime-500 cursor-pointer text-xs leading-none font-medium after:absolute after:inset-0"
            >
              Good
            </label>
          </div>
        </FormControl>
      </FormItem>

      <FormItem className="border-input has-data-[state=checked]:border-yellow-500/90 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex cursor-pointer flex-col items-center gap-3 rounded-md border px-2 py-3 text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]">
        <FormControl>
          <div className="flex flex-col items-center justify-center gap-2">
            <RadioGroupItem id={`${id}-3`} value="3" className="sr-only" />
            <Meh className="text-yellow-500" size={25} aria-hidden="true" />
            <label
              htmlFor={`${id}-3`}
              className="text-yellow-500 cursor-pointer text-xs leading-none font-medium after:absolute after:inset-0"
            >
              Avarage
            </label>
          </div>
        </FormControl>
      </FormItem>
      <FormItem className="border-input has-data-[state=checked]:border-orange-500/90 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex cursor-pointer flex-col items-center gap-3 rounded-md border px-2 py-3 text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]">
        <FormControl>
          <div className="flex flex-col items-center justify-center gap-2">
            <RadioGroupItem id={`${id}-2`} value="2" className="sr-only" />
            <Frown className="text-orange-500" size={25} aria-hidden="true" />
            <label
              htmlFor={`${id}-2`}
              className="text-orange-500 cursor-pointer text-xs leading-none font-medium after:absolute after:inset-0"
            >
              Poor
            </label>
          </div>
        </FormControl>
      </FormItem>
      <FormItem className="border-input has-data-[state=checked]:border-red-500/90 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex cursor-pointer flex-col items-center gap-3 rounded-md border px-2 py-3 text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]">
        <FormControl>
          <div className="flex flex-col items-center justify-center gap-2">
            <RadioGroupItem id={`${id}-1`} value="1" className="sr-only" />
            <Angry className="text-red-500" size={25} aria-hidden="true" />
            <label
              htmlFor={`${id}-1`}
              className="text-red-500 cursor-pointer text-xs leading-none font-medium after:absolute after:inset-0"
            >
              Bad
            </label>
          </div>
        </FormControl>
      </FormItem>
    </RadioGroup>
  );
}
