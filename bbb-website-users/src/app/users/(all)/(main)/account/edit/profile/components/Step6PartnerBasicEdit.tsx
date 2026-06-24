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

export function Step6PartnerBasicEdit({ form }: { form: any }) {
  // If age calculation is needed
  const dobValue = form.watch("dob");
  const age = dobValue ? new Date().getFullYear() - new Date(dobValue).getFullYear() : null;

  return (
    <div className="space-y-8">
      
          
          {/* Partner Basic */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">Partner Basic</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="partnerAgeRange" render={({ field }) => (
                <FormItem><FormLabel>Age Range (Min–Max)<FormBadge type="mandatory" /></FormLabel><FormControl><Input placeholder="e.g. 25-30" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="partnerHeightRange" render={({ field }) => (
                <FormItem><FormLabel>Height Range<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="e.g. 5ft 2in - 5ft 8in" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="partnerMaritalStatus" render={({ field }) => (
                <FormItem><FormLabel>Marital Status Preference<FormBadge type="recommended" /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Doesn't Matter">Doesn't Matter</SelectItem>
                      <SelectItem value="Never Married">Never Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="partnerMotherTongue" render={({ field }) => (
                <FormItem><FormLabel>Mother Tongue<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="e.g. Bengali" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="partnerSpokenLanguages" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Spoken Languages<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="e.g. English, Hindi" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          {/* Partner Professional & Education */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">Partner Professional & Education</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="partnerEmploymentType" render={({ field }) => (
                <FormItem><FormLabel>Employment Type<FormBadge type="optional" /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Doesn't Matter">Doesn't Matter</SelectItem>
                      <SelectItem value="Private Sector">Private Sector</SelectItem>
                      <SelectItem value="Government/Public Sector">Government/Public Sector</SelectItem>
                      <SelectItem value="Business/Self Employed">Business/Self Employed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="partnerOccupation" render={({ field }) => (
                <FormItem><FormLabel>Occupation<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="e.g. Software Engineer" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="partnerAnnualIncome" render={({ field }) => (
                <FormItem><FormLabel>Annual Income Range<FormBadge type="recommended" /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Doesn't Matter">Doesn't Matter</SelectItem>
                      <SelectItem value="3 - 5 Lakhs">3 - 5 Lakhs</SelectItem>
                      <SelectItem value="5 - 10 Lakhs">5 - 10 Lakhs</SelectItem>
                      <SelectItem value="10 - 20 Lakhs">10 - 20 Lakhs</SelectItem>
                      <SelectItem value="Over 20 Lakhs">Over 20 Lakhs</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="partnerMinimumQualification" render={({ field }) => (
                <FormItem><FormLabel>Minimum Qualification<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="e.g. Bachelor's Degree" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          {/* Partner Religious */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">Partner Religious</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="partnerReligion" render={({ field }) => (
                <FormItem><FormLabel>Religion<FormBadge type="mandatory" /></FormLabel><FormControl><Input placeholder="e.g. Hindu" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="partnerCaste" render={({ field }) => (
                <FormItem><FormLabel>Caste<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="e.g. Brahmin" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="partnerSubCaste" render={({ field }) => (
                <FormItem><FormLabel>Sub Caste<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="Sub Caste" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="partnerGothra" render={({ field }) => (
                <FormItem><FormLabel>Gothra<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="Gothra" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          
        
    </div>
  );
}
