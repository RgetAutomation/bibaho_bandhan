import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FormBadge } from "@/components/ui-custom/form-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function Step4PhysicalEdit({ form }: { form: any }) {
  // If age calculation is needed
  const dobValue = form.watch("dob");
  const age = dobValue ? new Date().getFullYear() - new Date(dobValue).getFullYear() : null;

  return (
    <div className="space-y-8">
      
          
          {/* My Habits */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">My Habits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="eatingHabits" render={({ field }) => (
                <FormItem><FormLabel>Eating Habits<FormBadge type="optional" /></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Non Vegetarian">Non Vegetarian</SelectItem>
                      <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="Eggetarian">Eggetarian</SelectItem>
                      <SelectItem value="Occasionally Non-Veg">Occasionally Non-Veg</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="drinkingHabits" render={({ field }) => (
                <FormItem><FormLabel>Drinking Habits<FormBadge type="optional" /></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="Occasionally">Occasionally</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="smokingHabits" render={({ field }) => (
                <FormItem><FormLabel>Smoking Habits<FormBadge type="optional" /></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="Occasionally">Occasionally</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          {/* My Physical & Health */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">My Physical & Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="bodyType" render={({ field }) => (
                <FormItem><FormLabel>Body Type<FormBadge type="optional" /></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select body type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Slim">Slim</SelectItem>
                      <SelectItem value="Average">Average</SelectItem>
                      <SelectItem value="Athletic">Athletic</SelectItem>
                      <SelectItem value="Muscular">Muscular</SelectItem>
                      <SelectItem value="Curvy">Curvy</SelectItem>
                      <SelectItem value="Chubby">Chubby</SelectItem>
                      <SelectItem value="Heavy">Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="skinTone" render={({ field }) => (
                <FormItem><FormLabel>Skin Tone<FormBadge type="optional" /></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select skin tone" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Light"><div className="flex items-center gap-2"><div className="bg-[#f8d2b3] h-4 w-4 rounded-full" /><span>Light</span></div></SelectItem>
                      <SelectItem value="Fair"><div className="flex items-center gap-2"><div className="bg-[#ebb68f] h-4 w-4 rounded-full" /><span>Fair</span></div></SelectItem>
                      <SelectItem value="Medium"><div className="flex items-center gap-2"><div className="bg-[#cfa07c] h-4 w-4 rounded-full" /><span>Medium</span></div></SelectItem>
                      <SelectItem value="Tan"><div className="flex items-center gap-2"><div className="bg-[#bd7852] h-4 w-4 rounded-full" /><span>Tan</span></div></SelectItem>
                      <SelectItem value="Brown"><div className="flex items-center gap-2"><div className="bg-[#90493d] h-4 w-4 rounded-full" /><span>Brown</span></div></SelectItem>
                      <SelectItem value="Dark"><div className="flex items-center gap-2"><div className="bg-[#3c1f1b] h-4 w-4 rounded-full" /><span>Dark</span></div></SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                <FormItem><FormLabel>Blood Group<FormBadge type="optional" /></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select blood group" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="healthScreening" render={({ field }) => (
                <FormItem><FormLabel>Health Screening<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="e.g. Any Major Illness?" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="speciallyAble" render={({ field }) => (
                <FormItem><FormLabel>Any Disability?<FormBadge type="recommended" /></FormLabel>
                  <Select onValueChange={(val) => field.onChange(val === "true")} defaultValue={field.value ? "true" : "false"}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              {form.watch("speciallyAble") && (
                <FormField control={form.control} name="disabilityDetails" render={({ field }) => (
                  <FormItem><FormLabel>Disability Details<FormBadge type="mandatory" /></FormLabel><FormControl><Input placeholder="Specify disability details" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              )}
            </div>
          </div>

          {/* About Myself */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">About Myself</h3>
            <FormField control={form.control} name="hobbies" render={({ field }) => (
              <FormItem><FormLabel>My Hobbies & Interests<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="e.g. Reading, Traveling" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="aboutMyself" render={({ field }) => (
              <FormItem><FormLabel>Description (500-1000 Characters)<FormBadge type="recommended" /></FormLabel><FormControl><Textarea className="h-32 resize-none" placeholder="Write about your background, personality, and what you are looking for..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="personalityTraits" render={({ field }) => (
                <FormItem><FormLabel>Personality Traits<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="e.g. Introvert, Ambitious" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="lifeGoals" render={({ field }) => (
                <FormItem><FormLabel>Life Goals<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="e.g. Career focus, peaceful life" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          
        
    </div>
  );
}
