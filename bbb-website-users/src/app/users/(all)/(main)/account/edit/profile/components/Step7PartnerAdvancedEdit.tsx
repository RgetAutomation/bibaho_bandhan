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

export function Step7PartnerAdvancedEdit({ form }: { form: any }) {
  // If age calculation is needed
  const dobValue = form.watch("dob");
  const age = dobValue ? new Date().getFullYear() - new Date(dobValue).getFullYear() : null;

  return (
    <div className="space-y-8">
      
          
          {/* Partner Location */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">Partner Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="partnerPreferredCountry" render={({ field }) => (
                <FormItem><FormLabel>Preferred Country<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="Country" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="partnerPreferredState" render={({ field }) => (
                <FormItem><FormLabel>Preferred State<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="State" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="partnerPreferredDistrict" render={({ field }) => (
                <FormItem><FormLabel>Preferred District<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="District" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          {/* Partner Habits & Physical */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">Partner Habits & Physical</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="partnerEatingHabit" render={({ field }) => (
                <FormItem><FormLabel>Eating Habit Preference<FormBadge type="optional" /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Doesn't Matter">Doesn't Matter</SelectItem>
                      <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="partnerDrinkingHabit" render={({ field }) => (
                <FormItem><FormLabel>Drinking Habit Preference<FormBadge type="optional" /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Doesn't Matter">Doesn't Matter</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Occasionally">Occasionally</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="partnerSmokingHabit" render={({ field }) => (
                <FormItem><FormLabel>Smoking Habit Preference<FormBadge type="optional" /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Doesn't Matter">Doesn't Matter</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Occasionally">Occasionally</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="partnerDisabilityAcceptable" render={({ field }) => (
                <FormItem><FormLabel>Any Disability Acceptable?<FormBadge type="recommended" /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          {/* About My Partner */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">About My Partner</h3>
            <FormField control={form.control} name="partnerDescription" render={({ field }) => (
              <FormItem><FormLabel>Description<FormBadge type="recommended" /></FormLabel><FormControl><Textarea className="h-24 resize-none" placeholder="Write about what you are looking for..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="partnerPersonalityExpectation" render={({ field }) => (
                <FormItem><FormLabel>Personality Expectation<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="e.g. Caring, Ambitious" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="partnerFamilyExpectation" render={({ field }) => (
                <FormItem><FormLabel>Family Expectation<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="e.g. Traditional, Supportive" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          {/* Partner Family Details */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">Partner Family Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="familyStatusPreference" render={({ field }) => (
                <FormItem><FormLabel>Family Status<FormBadge type="recommended" /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Doesn't Matter">Doesn't Matter</SelectItem>
                      <SelectItem value="Middle Class">Middle Class</SelectItem>
                      <SelectItem value="Upper Middle Class">Upper Middle Class</SelectItem>
                      <SelectItem value="Rich / Affluent">Rich / Affluent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="familyTypePreference" render={({ field }) => (
                <FormItem><FormLabel>Family Type<FormBadge type="recommended" /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Doesn't Matter">Doesn't Matter</SelectItem>
                      <SelectItem value="Nuclear">Nuclear</SelectItem>
                      <SelectItem value="Joint">Joint</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="familyValuesPreference" render={({ field }) => (
                <FormItem><FormLabel>Family Values<FormBadge type="recommended" /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Doesn't Matter">Doesn't Matter</SelectItem>
                      <SelectItem value="Orthodox">Orthodox</SelectItem>
                      <SelectItem value="Traditional">Traditional</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Liberal">Liberal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          
        
    </div>
  );
}
