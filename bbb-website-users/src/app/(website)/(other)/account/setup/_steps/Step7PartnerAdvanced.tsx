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
import { FormBadge } from "@/components/ui-custom/form-badge";

export const step7Schema = updateProfileSchema.pick({
  partnerPreferredCountry: true,
  partnerPreferredState: true,
  partnerPreferredDistrict: true,
  partnerEatingHabit: true,
  partnerDrinkingHabit: true,
  partnerSmokingHabit: true,
  partnerDisabilityAcceptable: true,
  partnerDescription: true,
  partnerPersonalityExpectation: true,
  partnerFamilyExpectation: true,
  familyStatusPreference: true,
  familyTypePreference: true,
  familyValuesPreference: true,
});

export type Step7Schema = z.infer<typeof step7Schema>;

export default function Step7PartnerAdvanced({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const setData = useUpdatingProfileStore((state) => state.setData);
  const stateData = useUpdatingProfileStore();

  const form = useForm<any>({
    resolver: zodResolver(step7Schema),
    defaultValues: {
      partnerPreferredCountry: stateData.partnerPreferredCountry || "",
      partnerPreferredState: stateData.partnerPreferredState || "",
      partnerPreferredDistrict: stateData.partnerPreferredDistrict || "",
      partnerEatingHabit: stateData.partnerEatingHabit || "",
      partnerDrinkingHabit: stateData.partnerDrinkingHabit || "",
      partnerSmokingHabit: stateData.partnerSmokingHabit || "",
      partnerDisabilityAcceptable: stateData.partnerDisabilityAcceptable || "",
      partnerDescription: stateData.partnerDescription || "",
      partnerPersonalityExpectation: stateData.partnerPersonalityExpectation || "",
      partnerFamilyExpectation: stateData.partnerFamilyExpectation || "",
      familyStatusPreference: stateData.familyStatusPreference || "",
      familyTypePreference: stateData.familyTypePreference || "",
      familyValuesPreference: stateData.familyValuesPreference || "",
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
        <h2 className="text-center md:text-left text-2xl font-bold text-slate-800 dark:text-foreground">Partner Preference (Part 2)</h2>
        <p className="hidden md:block text-slate-500 dark:text-muted-foreground">Location, Lifestyle & Family Expectations</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
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

          <StepActions loading={loading} showBack={true} onBack={onBack} submitLabel="Save & Continue" />
        </form>
      </Form>
    </div>
  );
}
