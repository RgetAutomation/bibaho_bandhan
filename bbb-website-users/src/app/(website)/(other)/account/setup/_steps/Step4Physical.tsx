"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProfileSchema } from "@/schema/updateProfileSchema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdatingProfileStore } from "@/lib/updateProfileStore";
import StepActions from "./StepActions";

export const step4Schema = updateProfileSchema.pick({
  eatingHabits: true,
  drinkingHabits: true,
  smokingHabits: true,
  bodyType: true,
  skinTone: true,
  bloodGroup: true,
  speciallyAble: true, // Disability
  disabilityDetails: true,
  healthScreening: true,
  hobbies: true,
  aboutMyself: true,
  personalityTraits: true,
  lifeGoals: true,
}).superRefine((data, ctx) => {
  if (data.speciallyAble && (!data.disabilityDetails || data.disabilityDetails.trim() === "")) {
    ctx.addIssue({
      code: "custom",
      path: ["disabilityDetails"],
      message: "Please provide details about the disability",
    });
  }
});

export type Step4Schema = z.infer<typeof step4Schema>;

export default function Step4Physical({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const setData = useUpdatingProfileStore((state) => state.setData);
  const stateData = useUpdatingProfileStore();

  const form = useForm<any>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      eatingHabits: stateData.eatingHabits || "",
      drinkingHabits: stateData.drinkingHabits || "",
      smokingHabits: stateData.smokingHabits || "",
      bodyType: stateData.bodyType || "",
      skinTone: stateData.skinTone || "",
      bloodGroup: stateData.bloodGroup || "",
      speciallyAble: stateData.speciallyAble || false,
      disabilityDetails: stateData.disabilityDetails || "",
      healthScreening: stateData.healthScreening || "",
      hobbies: stateData.hobbies || "",
      aboutMyself: stateData.aboutMyself || "",
      personalityTraits: stateData.personalityTraits || "",
      lifeGoals: stateData.lifeGoals || "",
    },
  });

  const onSubmit = (data: any) => {
    setLoading(true);
    setTimeout(() => {
      setData(data);
      setLoading(false);
      onComplete();
    }, 400);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-foreground">Physical, Lifestyle & About Me</h2>
        <p className="text-slate-500 dark:text-muted-foreground">My Health, Habits, and Personal Traits</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* My Habits */}
          <div className="space-y-4 bg-white dark:bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">My Habits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="eatingHabits" render={({ field }) => (
                <FormItem><FormLabel>Eating Habits (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                <FormItem><FormLabel>Drinking Habits (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                <FormItem><FormLabel>Smoking Habits (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
          <div className="space-y-4 bg-white dark:bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">My Physical & Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="bodyType" render={({ field }) => (
                <FormItem><FormLabel>Body Type (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select body type" /></SelectTrigger></FormControl>
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
                <FormItem><FormLabel>Skin Tone (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select skin tone" /></SelectTrigger></FormControl>
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
                <FormItem><FormLabel>Blood Group (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger></FormControl>
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
                <FormItem><FormLabel>Health Screening (Optional)</FormLabel><FormControl><Input placeholder="e.g. Any Major Illness?" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="speciallyAble" render={({ field }) => (
                <FormItem><FormLabel>Any Disability? (Recommended)</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val === "true")} defaultValue={field.value ? "true" : "false"}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                  <FormItem><FormLabel>Disability Details <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="Specify disability details" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              )}
            </div>
          </div>

          {/* About Myself */}
          <div className="space-y-4 bg-white dark:bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">About Myself</h3>
            <FormField control={form.control} name="hobbies" render={({ field }) => (
              <FormItem><FormLabel>My Hobbies & Interests (Optional)</FormLabel><FormControl><Input placeholder="e.g. Reading, Traveling" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="aboutMyself" render={({ field }) => (
              <FormItem><FormLabel>Description (500-1000 Characters) (Recommended)</FormLabel><FormControl><Textarea className="h-32 resize-none" placeholder="Write about your background, personality, and what you are looking for..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="personalityTraits" render={({ field }) => (
                <FormItem><FormLabel>Personality Traits (Recommended)</FormLabel><FormControl><Input placeholder="e.g. Introvert, Ambitious" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="lifeGoals" render={({ field }) => (
                <FormItem><FormLabel>Life Goals (Optional)</FormLabel><FormControl><Input placeholder="e.g. Career focus, peaceful life" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          <StepActions loading={loading} showBack={true} onBack={onBack} submitLabel="Save & Continue" />
        </form>
      </Form>
    </div>
  );
}
