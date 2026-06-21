"use client";

import { UserType } from "@/components/enum/userType";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdatingProfileStore } from "@/lib/updateProfileStore";
import { profilePartnerPreferenceSchema } from "@/schema/updateProfileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import z from "zod";
import ProfileCompletedComponent from "@/components/profile/profileCompletedComponent";
import { LoadingButton } from "@/components/loadingButton";
import { AxiosResponse } from "@/components/interface/AxiosResponse";
import api from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Textarea } from "@/components/ui/textarea";

type ProfilePartnerPreferenceSchema = z.infer<
  typeof profilePartnerPreferenceSchema
>;

export default function PartnerPreferencePage() {
  return (
    <ProfileContent />
  );
}

function ProfileContent() {
  const pinCode = useUpdatingProfileStore((state) => state.pinCode);
  const dob = useUpdatingProfileStore((state) => state.dob);
  const hydrated = useUpdatingProfileStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) return;

    if (!dob || dob === null) {
      redirect("/account/setup");
    } else if (!pinCode || pinCode === null) {
      redirect("/account/setup/contact");
    }
  }, [dob, hydrated, pinCode]);

  return (
    <div className="flex flex-col flex-1">
      <PartnerPreferenceForm />
    </div>
  );
}

function PartnerPreferenceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const store = useUpdatingProfileStore();

  const form = useForm<ProfilePartnerPreferenceSchema>({
    resolver: zodResolver(
      profilePartnerPreferenceSchema
    ) as unknown as Resolver<ProfilePartnerPreferenceSchema>,
    defaultValues: {
      partnerAgeRange: "",
      partnerHeightRange: "",
      partnerWeightRange: "",
      partnerMaritalStatus: "",
      partnerMotherTongue: "",
      partnerSpokenLanguages: "",
      partnerEmploymentType: "",
      partnerOccupation: "",
      partnerAnnualIncome: "",
      partnerMinimumQualification: "",
      partnerReligion: "",
      partnerCaste: "",
      partnerSubCaste: "",
      partnerGothra: "",
      partnerPreferredCountry: "",
      partnerPreferredState: "",
      partnerPreferredDistrict: "",
      partnerEatingHabit: "",
      partnerDrinkingHabit: "",
      partnerSmokingHabit: "",
      partnerDisabilityAcceptable: "",
      partnerDescription: "",
      partnerPersonalityExpectation: "",
      partnerFamilyExpectation: "",
      partnerFamilyDetails: "",
      familyStatusPreference: "",
      familyTypePreference: "",
      familyValuesPreference: "",
    },
  });

  const onSubmit = async (data: ProfilePartnerPreferenceSchema) => {
    setLoading(true);
    store.setData(data);
    router.push("/account/setup/face-verify");
  };

  return (
    <div className={"flex flex-1 flex-col"}>
      <div className="flex flex-col flex-1 overflow-y-auto p-4 md:p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 bg-card rounded-2xl shadow-md p-6 max-w-4xl mx-auto w-full"
          >
            <div className="space-y-1 border-b pb-3">
              <h1 className="text-lg font-semibold text-primary">
                Partner Preferences
              </h1>
              <p className="text-sm text-muted-foreground">
                Help us find the best matches by setting your partner preferences.
              </p>
            </div>

            {/* Basic */}
            <div className="space-y-4">
              <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
                Partner Basic
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="partnerAgeRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Age Range (Min–Max) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 25-30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerHeightRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height Range (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 5ft 2in - 5ft 8in" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerWeightRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight Range (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 50-65 kg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerMaritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marital Status Preference (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Never Married" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerMotherTongue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mother Tongue (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Bengali" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerSpokenLanguages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spoken Languages (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. English, Hindi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Professional */}
            <div className="space-y-4">
              <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
                Partner Professional
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="partnerEmploymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Type (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Private Job, Govt Job" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerOccupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Engineer, Doctor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerAnnualIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Income Range (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 5-10 LPA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
                Partner Education
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="partnerMinimumQualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Qualification Required (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Bachelor's Degree" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Religious */}
            <div className="space-y-4">
              <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
                Partner Religious
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="partnerReligion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Religion <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Hindu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerCaste"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caste (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. General" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerSubCaste"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub Caste (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter sub caste" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerGothra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gothra (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter gothra" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
                Partner Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="partnerPreferredCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Country (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. India" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerPreferredState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred State (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. West Bengal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerPreferredDistrict"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred District (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Kolkata" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Habits */}
            <div className="space-y-4">
              <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
                Partner Habits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="partnerEatingHabit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eating Habit (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Non-veg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerDrinkingHabit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drinking Habit (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. No" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerSmokingHabit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Smoking Habit (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. No" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Physical */}
            <div className="space-y-4">
              <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
                Partner Physical
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="partnerDisabilityAcceptable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Any Disability Acceptable (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Yes/No" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* About Partner & Family Details */}
            <div className="space-y-4">
              <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
                About My Partner & Family Details
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="partnerDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Recommended)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your ideal partner..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerPersonalityExpectation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personality Expectation (Recommended)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What personality traits are you looking for?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerFamilyExpectation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family Expectation (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any expectations regarding the family?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerFamilyDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Family Details (Recommended)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any specific details?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="familyStatusPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family Status Preference (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Middle Class" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="familyTypePreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family Type Preference (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Nuclear Family" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="familyValuesPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family Values Preference (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Traditional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-8">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full"
                onClick={() => router.back()}
              >
                <>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span>Back</span>
                </>
              </Button>
              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={loading}
              >
                {loading ? (
                  <LoadingButton title="Saving..." />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span>Submit</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
