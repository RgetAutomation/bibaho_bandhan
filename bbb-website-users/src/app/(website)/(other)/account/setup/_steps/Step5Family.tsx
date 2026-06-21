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

export const step5Schema = updateProfileSchema.pick({
  fathersOccupation: true,
  mothersOccupation: true,
  noOfBrothers: true,
  brothersMarriedCount: true,
  noOfSisters: true,
  sistersMarriedCount: true,
  myFamilyStatus: true,
  myFamilyType: true,
  myFamilyValues: true,
  familyDescription: true,
  familyBackground: true,
  culturalValues: true,
});

export type Step5Schema = z.infer<typeof step5Schema>;

export default function Step5Family({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const setData = useUpdatingProfileStore((state) => state.setData);
  const stateData = useUpdatingProfileStore();

  const form = useForm<any>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      fathersOccupation: stateData.fathersOccupation || "",
      mothersOccupation: stateData.mothersOccupation || "",
      noOfBrothers: stateData.noOfBrothers || "",
      brothersMarriedCount: stateData.brothersMarriedCount || "",
      noOfSisters: stateData.noOfSisters || "",
      sistersMarriedCount: stateData.sistersMarriedCount || "",
      myFamilyStatus: stateData.myFamilyStatus || "",
      myFamilyType: stateData.myFamilyType || "",
      myFamilyValues: stateData.myFamilyValues || "",
      familyDescription: stateData.familyDescription || "",
      familyBackground: stateData.familyBackground || "",
      culturalValues: stateData.culturalValues || "",
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
        <h2 className="text-2xl font-bold text-slate-800 dark:text-foreground">Family Details</h2>
        <p className="text-slate-500 dark:text-muted-foreground">My Family Background and Values</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Basic Family */}
          <div className="space-y-4 bg-white dark:bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">Basic My Family</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="fathersOccupation" render={({ field }) => (
                <FormItem><FormLabel>Father&apos;s Occupation (Recommended)</FormLabel><FormControl><Input placeholder="e.g. Business" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="mothersOccupation" render={({ field }) => (
                <FormItem><FormLabel>Mother&apos;s Occupation (Recommended)</FormLabel><FormControl><Input placeholder="e.g. Homemaker" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="noOfBrothers" render={({ field }) => (
                <FormItem><FormLabel>No. of Brothers (Recommended)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="brothersMarriedCount" render={({ field }) => (
                <FormItem><FormLabel>Brothers Married Count (Optional)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="noOfSisters" render={({ field }) => (
                <FormItem><FormLabel>No. of Sisters (Recommended)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="sistersMarriedCount" render={({ field }) => (
                <FormItem><FormLabel>Sisters Married Count (Optional)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="myFamilyStatus" render={({ field }) => (
                <FormItem><FormLabel>Family Status <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                <FormItem><FormLabel>Family Type <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                <FormItem className="md:col-span-2"><FormLabel>Family Values (Recommended)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
          <div className="space-y-4 bg-white dark:bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 text-primary">About My Family</h3>
            <FormField control={form.control} name="familyDescription" render={({ field }) => (
              <FormItem><FormLabel>Family Description (Optional)</FormLabel><FormControl><Textarea className="h-24 resize-none" placeholder="Write about your family..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="familyBackground" render={({ field }) => (
                <FormItem><FormLabel>Family Background (Optional)</FormLabel><FormControl><Input placeholder="e.g. Business background" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="culturalValues" render={({ field }) => (
                <FormItem><FormLabel>Cultural Values (Optional)</FormLabel><FormControl><Input placeholder="e.g. Traditional, Liberal" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          <StepActions loading={loading} showBack={true} onBack={onBack} submitLabel="Save & Continue" />
        </form>
      </Form>
    </div>
  );
}
