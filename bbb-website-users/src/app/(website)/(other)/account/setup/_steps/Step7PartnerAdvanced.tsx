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
        <h2 className="text-2xl font-bold text-slate-800 dark:text-foreground">Partner Preference (Part 2)</h2>
        <p className="text-slate-500 dark:text-muted-foreground">Location, Lifestyle & Family Expectations</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Partner Location */}
          <div className="space-y-4 bg-white dark:bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">Partner Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="partnerPreferredCountry" render={({ field }) => (
                <FormItem><FormLabel>Preferred Country (Recommended)</FormLabel><FormControl><Input placeholder="Country" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="partnerPreferredState" render={({ field }) => (
                <FormItem><FormLabel>Preferred State (Recommended)</FormLabel><FormControl><Input placeholder="State" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="partnerPreferredDistrict" render={({ field }) => (
                <FormItem><FormLabel>Preferred District (Optional)</FormLabel><FormControl><Input placeholder="District" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          {/* Partner Habits & Physical */}
          <div className="space-y-4 bg-white dark:bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">Partner Habits & Physical</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="partnerEatingHabit" render={({ field }) => (
                <FormItem><FormLabel>Eating Habit Preference (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                <FormItem><FormLabel>Drinking Habit Preference (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                <FormItem><FormLabel>Smoking Habit Preference (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                <FormItem><FormLabel>Any Disability Acceptable? (Recommended)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
          <div className="space-y-4 bg-white dark:bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">About My Partner</h3>
            <FormField control={form.control} name="partnerDescription" render={({ field }) => (
              <FormItem><FormLabel>Description (Recommended)</FormLabel><FormControl><Textarea className="h-24 resize-none" placeholder="Write about what you are looking for..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="partnerPersonalityExpectation" render={({ field }) => (
                <FormItem><FormLabel>Personality Expectation (Recommended)</FormLabel><FormControl><Input placeholder="e.g. Caring, Ambitious" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="partnerFamilyExpectation" render={({ field }) => (
                <FormItem><FormLabel>Family Expectation (Optional)</FormLabel><FormControl><Input placeholder="e.g. Traditional, Supportive" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          {/* Partner Family Details */}
          <div className="space-y-4 bg-white dark:bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">Partner Family Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="familyStatusPreference" render={({ field }) => (
                <FormItem><FormLabel>Family Status (Recommended)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                <FormItem><FormLabel>Family Type (Recommended)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                <FormItem><FormLabel>Family Values (Recommended)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
