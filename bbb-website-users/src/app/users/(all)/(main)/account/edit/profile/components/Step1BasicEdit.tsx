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

export function Step1BasicEdit({ form }: { form: any }) {
  // If age calculation is needed
  const dobValue = form.watch("dob");
  const age = dobValue ? new Date().getFullYear() - new Date(dobValue).getFullYear() : null;

  return (
    <div className="space-y-8">
      
          
          {/* My Basic */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">My Basic</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem><FormLabel>First Name<FormBadge type="mandatory" /></FormLabel><FormControl><Input placeholder="First Name" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="middleName" render={({ field }) => (
                <FormItem><FormLabel>Middle Name<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="Middle Name" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem><FormLabel>Last Name<FormBadge type="mandatory" /></FormLabel><FormControl><Input placeholder="Last Name" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="dob" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth<FormBadge type="mandatory" /></FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date?.toISOString())} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus captionLayout="dropdown" fromYear={1900} toYear={new Date().getFullYear()} />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl><Input disabled value={age !== null ? `${age} years` : "Auto-calculated"} className="bg-muted" /></FormControl>
              </FormItem>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="height" render={({ field }) => (
                <FormItem><FormLabel>Height<FormBadge type="mandatory" /></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select your height" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Less than 5 feet</SelectLabel>
                        <SelectItem value="4 ft 5 in">4 ft 5 in</SelectItem>
                        <SelectItem value="4 ft 6 in">4 ft 6 in</SelectItem>
                        <SelectItem value="4 ft 7 in">4 ft 7 in</SelectItem>
                        <SelectItem value="4 ft 8 in">4 ft 8 in</SelectItem>
                        <SelectItem value="4 ft 9 in">4 ft 9 in</SelectItem>
                        <SelectItem value="4 ft 10 in">4 ft 10 in</SelectItem>
                        <SelectItem value="4 ft 11 in">4 ft 11 in</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Less than 6 feet</SelectLabel>
                        <SelectItem value="5 ft">5 ft</SelectItem>
                        <SelectItem value="5 ft 1 in">5 ft 1 in</SelectItem>
                        <SelectItem value="5 ft 2 in">5 ft 2 in</SelectItem>
                        <SelectItem value="5 ft 3 in">5 ft 3 in</SelectItem>
                        <SelectItem value="5 ft 4 in">5 ft 4 in</SelectItem>
                        <SelectItem value="5 ft 5 in">5 ft 5 in</SelectItem>
                        <SelectItem value="5 ft 6 in">5 ft 6 in</SelectItem>
                        <SelectItem value="5 ft 7 in">5 ft 7 in</SelectItem>
                        <SelectItem value="5 ft 8 in">5 ft 8 in</SelectItem>
                        <SelectItem value="5 ft 9 in">5 ft 9 in</SelectItem>
                        <SelectItem value="5 ft 10 in">5 ft 10 in</SelectItem>
                        <SelectItem value="5 ft 11 in">5 ft 11 in</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Upto 7 feet</SelectLabel>
                        <SelectItem value="6 ft">6 ft</SelectItem>
                        <SelectItem value="6 ft 1 in">6 ft 1 in</SelectItem>
                        <SelectItem value="6 ft 2 in">6 ft 2 in</SelectItem>
                        <SelectItem value="6 ft 3 in">6 ft 3 in</SelectItem>
                        <SelectItem value="6 ft 4 in">6 ft 4 in</SelectItem>
                        <SelectItem value="6 ft 5 in">6 ft 5 in</SelectItem>
                        <SelectItem value="6 ft 6 in">6 ft 6 in</SelectItem>
                        <SelectItem value="6 ft 7 in">6 ft 7 in</SelectItem>
                        <SelectItem value="6 ft 8 in">6 ft 8 in</SelectItem>
                        <SelectItem value="6 ft 9 in">6 ft 9 in</SelectItem>
                        <SelectItem value="6 ft 10 in">6 ft 10 in</SelectItem>
                        <SelectItem value="6 ft 11 in">6 ft 11 in</SelectItem>
                        <SelectItem value="7 ft">7 ft</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="weight" render={({ field }) => (
                <FormItem><FormLabel>Weight (Kg)<FormBadge type="recommended" /></FormLabel><FormControl><Input type="decimal" inputMode="decimal" placeholder="Write your weight" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="maritalStatus" render={({ field }) => (
                <FormItem><FormLabel>Marital Status<FormBadge type="mandatory" /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select marital status" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="NEVER MARRIED">NEVER MARRIED</SelectItem>
                      <SelectItem value="DIVORCED">DIVORCED</SelectItem>
                      <SelectItem value="WIDOWED">WIDOWED</SelectItem>
                      <SelectItem value="WIDOWER">WIDOWER</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="motherTongue" render={({ field }) => (
                <FormItem><FormLabel>Mother Tongue<FormBadge type="mandatory" /></FormLabel><FormControl><Input placeholder="e.g. Bengali" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            {(form.watch("maritalStatus") && form.watch("maritalStatus") !== "NEVER MARRIED") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="children" render={({ field }) => (
                  <FormItem><FormLabel>No. of Children<FormBadge type="mandatory" /></FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="childrenLivingWith" render={({ field }) => (
                  <FormItem><FormLabel>Children Living With<FormBadge type="mandatory" /></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Me">Me</SelectItem>
                        <SelectItem value="Partner">Partner</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}
            
            <FormField control={form.control} name="spokenLanguages" render={({ field }) => (
              <FormItem><FormLabel>Spoken Languages<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="e.g. Bengali, English, Hindi" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          {/* My Contact */}
          <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">My Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="emailId" render={({ field }) => (
                <FormItem><FormLabel>Email ID<FormBadge type="recommended" /></FormLabel><FormControl><Input type="email" placeholder="Email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem><FormLabel>Phone Number<FormBadge type="mandatory" /></FormLabel><FormControl><Input placeholder="Phone Number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="whatsappNumber" render={({ field }) => (
                <FormItem><FormLabel>WhatsApp Number<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="WhatsApp Number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="alternatePhone" render={({ field }) => (
                <FormItem><FormLabel>Alternate Number<FormBadge type="optional" /></FormLabel><FormControl><Input placeholder="Alternate Number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="relationshipWithBrideGroom" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Relationship with Bride/Groom<FormBadge type="mandatory" /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select relationship" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Self">Self</SelectItem>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Relative">Relative</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
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
