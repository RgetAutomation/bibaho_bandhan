import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormBadge } from "@/components/ui-custom/form-badge";

export function Step2CareerEdit({ form }: { form: any }) {
  return (
    <div className="space-y-8">

      {/* My Professional */}
      <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
        <h3 className="text-lg font-semibold border-b pb-2 text-primary">My Professional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <FormField control={form.control} name="employmentType" render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Type<FormBadge type="mandatory" /></FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Private Sector">Private Sector</SelectItem>
                  <SelectItem value="Government/Public Sector">Government/Public Sector</SelectItem>
                  <SelectItem value="Civil Services">Civil Services</SelectItem>
                  <SelectItem value="Defense">Defense</SelectItem>
                  <SelectItem value="Business/Self Employed">Business/Self Employed</SelectItem>
                  <SelectItem value="Not Working">Not Working</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="profession" render={({ field }) => (
            <FormItem><FormLabel>Occupation<FormBadge type="mandatory" /></FormLabel><FormControl><Input placeholder="e.g. Software Engineer" {...field} /></FormControl><FormMessage /></FormItem>
          )} />

          <FormField control={form.control} name="occupationDetails" render={({ field }) => (
            <FormItem><FormLabel>Occupation Details<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="More details about occupation" {...field} /></FormControl><FormMessage /></FormItem>
          )} />

          <FormField control={form.control} name="designation" render={({ field }) => (
            <FormItem><FormLabel>Designation<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="e.g. Senior Manager" {...field} /></FormControl><FormMessage /></FormItem>
          )} />

          <FormField control={form.control} name="workExperience" render={({ field }) => (
            <FormItem><FormLabel>Work Experience (Years)<FormBadge type="recommended" /></FormLabel><FormControl><Input type="number" placeholder="e.g. 5" {...field} /></FormControl><FormMessage /></FormItem>
          )} />

          <FormField control={form.control} name="organizationName" render={({ field }) => (
            <FormItem><FormLabel>Organization Name<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="e.g. Google" {...field} /></FormControl><FormMessage /></FormItem>
          )} />

          <FormField control={form.control} name="companyName" render={({ field }) => (
            <FormItem><FormLabel>Company / Business Name<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="e.g. Alphabet Inc." {...field} /></FormControl><FormMessage /></FormItem>
          )} />

          <FormField control={form.control} name="monthlyIncome" render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Income<FormBadge type="mandatory" /></FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select income range" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Less than 5 lakh</SelectLabel>
                    <SelectItem value="No Income">No Income</SelectItem>
                    <SelectItem value="0 - 1 lakh">0 - 1 lakh</SelectItem>
                    <SelectItem value="1 - 2 lakh">1 - 2 lakh</SelectItem>
                    <SelectItem value="2 - 3 lakh">2 - 3 lakh</SelectItem>
                    <SelectItem value="3 - 4 lakh">3 - 4 lakh</SelectItem>
                    <SelectItem value="4 - 5 lakh">4 - 5 lakh</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>5 lakh to 15 lakh</SelectLabel>
                    <SelectItem value="5 - 6 lakh">5 - 6 lakh</SelectItem>
                    <SelectItem value="6 - 7 lakh">6 - 7 lakh</SelectItem>
                    <SelectItem value="7 - 8 lakh">7 - 8 lakh</SelectItem>
                    <SelectItem value="8 - 9 lakh">8 - 9 lakh</SelectItem>
                    <SelectItem value="9 - 10 lakh">9 - 10 lakh</SelectItem>
                    <SelectItem value="10 - 15 lakh">10 - 15 lakh</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>15 lakh to 50 lakh</SelectLabel>
                    <SelectItem value="15 - 20 lakh">15 - 20 lakh</SelectItem>
                    <SelectItem value="20 - 25 lakh">20 - 25 lakh</SelectItem>
                    <SelectItem value="25 - 30 lakh">25 - 30 lakh</SelectItem>
                    <SelectItem value="30 - 35 lakh">30 - 35 lakh</SelectItem>
                    <SelectItem value="35 - 40 lakh">35 - 40 lakh</SelectItem>
                    <SelectItem value="40 - 45 lakh">40 - 45 lakh</SelectItem>
                    <SelectItem value="45 - 50 lakh">45 - 50 lakh</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>50 lakh to 1 crore</SelectLabel>
                    <SelectItem value="50 - 55 lakh">50 - 55 lakh</SelectItem>
                    <SelectItem value="55 - 60 lakh">55 - 60 lakh</SelectItem>
                    <SelectItem value="60 - 65 lakh">60 - 65 lakh</SelectItem>
                    <SelectItem value="65 - 70 lakh">65 - 70 lakh</SelectItem>
                    <SelectItem value="70 - 75 lakh">70 - 75 lakh</SelectItem>
                    <SelectItem value="75 - 80 lakh">75 - 80 lakh</SelectItem>
                    <SelectItem value="80 - 85 lakh">80 - 85 lakh</SelectItem>
                    <SelectItem value="85 - 90 lakh">85 - 90 lakh</SelectItem>
                    <SelectItem value="90 - 95 lakh">90 - 95 lakh</SelectItem>
                    <SelectItem value="95 lakh - 1 crore">95 lakh - 1 crore</SelectItem>
                    <SelectItem value="1 crore & above">1 crore & above</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

        </div>
      </div>

      {/* My Education */}
      <div className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm">
        <h3 className="text-lg font-semibold border-b pb-2 text-primary">My Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="education" render={({ field }) => (
            <FormItem><FormLabel>Highest Qualification<FormBadge type="mandatory" /></FormLabel><FormControl><Input placeholder="e.g. Master's Degree" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="collegeInstitution" render={({ field }) => (
            <FormItem><FormLabel>College / Institution<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="e.g. XYZ University" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="fieldOfStudy" render={({ field }) => (
            <FormItem><FormLabel>Field of Study<FormBadge type="recommended" /></FormLabel><FormControl><Input placeholder="e.g. Computer Science" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
      </div>

    </div>
  );
}
