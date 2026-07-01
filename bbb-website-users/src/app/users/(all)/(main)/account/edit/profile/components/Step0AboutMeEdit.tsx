import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export function Step0AboutMeEdit({ form }: { form: any }) {
  return (
    <div className="space-y-8">
      <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
        <h3 className="text-lg font-semibold border-b pb-2 text-primary">About Me</h3>
        
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="aboutMyself"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About Myself</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write a little bit about yourself..."
                    className="min-h-[120px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
