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

export function Step5FamilyEdit({ form }: { form: any }) {
  // If age calculation is needed
  const dobValue = form.watch("dob");
  const age = dobValue ? new Date().getFullYear() - new Date(dobValue).getFullYear() : null;

  return (
    <div className="space-y-8">
      
          
          {/* Basic Family */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">Basic My Family</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="fathersOccupation" render={({ field }) => (
                <FormItem><FormLabel>Father&apos;s Occupation<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="e.g. Business" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="mothersOccupation" render={({ field }) => (
                <FormItem><FormLabel>Mother&apos;s Occupation<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="e.g. Homemaker" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="noOfBrothers" render={({ field }) => (
                <FormItem><FormLabel>No. of Brothers<FormBadge type="recommended" /></FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="brothersMarriedCount" render={({ field }) => (
                <FormItem><FormLabel>Brothers Married Count<FormBadge type="optional" /></FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="noOfSisters" render={({ field }) => (
                <FormItem><FormLabel>No. of Sisters<FormBadge type="recommended" /></FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="sistersMarriedCount" render={({ field }) => (
                <FormItem><FormLabel>Sisters Married Count<FormBadge type="optional" /></FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="myFamilyStatus" render={({ field }) => (
                <FormItem><FormLabel>Family Status<FormBadge type="mandatory" /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Middle Class">Middle Class</SelectItem>
                      <SelectItem value="Upper Middle Class">Upper Middle Class</SelectItem>
                      <SelectItem value="Rich / Affluent">Rich / Affluent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="myFamilyType" render={({ field }) => (
                <FormItem><FormLabel>Family Type<FormBadge type="mandatory" /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Joint">Joint Family</SelectItem>
                      <SelectItem value="Nuclear">Nuclear Family</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="myFamilyValues" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Family Values<FormBadge type="recommended" /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
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

          {/* About My Family */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">About My Family</h3>
            <FormField control={form.control} name="familyDescription" render={({ field }) => (
              <FormItem><FormLabel>Family Description<FormBadge type="optional" /></FormLabel><FormControl><Textarea className="h-24 resize-none" placeholder="Write about your family..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="familyBackground" render={({ field }) => (
                <FormItem><FormLabel>Family Background<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="e.g. Business background" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="culturalValues" render={({ field }) => (
                <FormItem><FormLabel>Cultural Values<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="e.g. Traditional, Liberal" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          
        
    </div>
  );
}
