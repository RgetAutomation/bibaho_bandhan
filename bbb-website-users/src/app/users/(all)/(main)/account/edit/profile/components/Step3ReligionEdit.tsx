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

export function Step3ReligionEdit({ form }: { form: any }) {
  // If age calculation is needed
  const dobValue = form.watch("dob");
  const age = dobValue ? new Date().getFullYear() - new Date(dobValue).getFullYear() : null;

  return (
    <div className="space-y-8">
      
          
          {/* My Religious */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">My Religious</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="religion" render={({ field }) => (
                <FormItem><FormLabel>Religion<FormBadge type="mandatory" /></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select religion" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {["HINDU", "CHRISTIAN", "MUSLIM", "SIKH", "BUDHIST", "SARNAISM", "JAIN", "OTHER"].map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="caste" render={({ field }) => (
                <FormItem><FormLabel>Caste<FormBadge type="recommended" /></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select caste" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {["GENERAL", "OBC", "SC", "ST", "OTHERS"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="subCaste" render={({ field }) => (
                <FormItem><FormLabel>Sub Caste<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="Sub Caste" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="gotra" render={({ field }) => (
                <FormItem><FormLabel>Gothra<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="Gothra" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          {/* My Astrology */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">My Astrology</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="rashi" render={({ field }) => (
                <FormItem><FormLabel>Rashi<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="Rashi" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="nakshatra" render={({ field }) => (
                <FormItem><FormLabel>Star / Nakshatra<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="Nakshatra" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="manglik" render={({ field }) => (
                <FormItem><FormLabel>Manglik Dosh<FormBadge type="optional" /></FormLabel>
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
              <FormField control={form.control} name="timeOfBirth" render={({ field }) => (
                <FormItem><FormLabel>Time of Birth<FormBadge type="optional" /></FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="cityOfBirth" render={({ field }) => (
                <FormItem><FormLabel>City of Birth<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="City of Birth" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="countryOfBirth" render={({ field }) => (
                <FormItem><FormLabel>Country of Birth<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="Country of Birth" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          {/* My Location */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">My Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="country" render={({ field }) => (
                <FormItem><FormLabel>Country<FormBadge type="mandatory" /></FormLabel><FormControl><Input placeholder="Country" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem><FormLabel>State<FormBadge type="mandatory" /></FormLabel><FormControl><Input placeholder="State" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dist" render={({ field }) => (
                <FormItem><FormLabel>District<FormBadge type="mandatory" /></FormLabel><FormControl><Input placeholder="District" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="addressLine1" render={({ field }) => (
                <FormItem><FormLabel>Town / Village<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="Town / Village" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="citizenship" render={({ field }) => (
                <FormItem><FormLabel>Citizenship<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="Citizenship" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="ancestralOrigin" render={({ field }) => (
                <FormItem><FormLabel>Ancestral Origin<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="Ancestral Origin" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="pinCode" render={({ field }) => (
                <FormItem><FormLabel>Pin Code<FormBadge type="recommended" /></FormLabel><FormControl><Input type="text" inputMode="numeric" maxLength={6} placeholder="Pin Code" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          
        
    </div>
  );
}
