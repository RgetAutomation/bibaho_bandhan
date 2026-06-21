"use client";

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
import { profileContactSchema } from "@/schema/updateProfileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
//import { City, State } from "country-state-city";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import z from "zod";
import { useUpdatingProfileStore } from "@/lib/updateProfileStore";
import { UserType } from "@/components/enum/userType";
import ProfileCompletedComponent from "@/components/profile/profileCompletedComponent";
import { LoadingButton } from "@/components/loadingButton";
import { useAuthSession } from "@/hooks/useAuthSession";
import DashboardHeader from "@/components/dashboard/header";

type ProfileContactSchema = z.infer<typeof profileContactSchema>;

export default function ContactDetailsPage() {
  const { user } = useAuthSession();
  const userType = user?.type as UserType;

  return (
    <ProfileContent
      userType={userType}
      isProfileComplete={user?.isProfileComplete as boolean}
    />
  );
}

function ProfileContent({
  userType,
  isProfileComplete,
}: {
  userType: UserType;
  isProfileComplete: boolean;
}) {
  const dob = useUpdatingProfileStore((state) => state.dob);
  const hydrated = useUpdatingProfileStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) return;

    if (!dob || dob === null) {
      redirect("/users/account/complete");
    }
  }, [dob, hydrated]);

  // allow free users as well

  return (
    <div className="flex flex-col flex-1">
      {isProfileComplete ? (
        <ProfileCompletedComponent />
      ) : (
        <ContactDetailsForm />
      )}
    </div>
  );
}

function ContactDetailsForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const addressLine1 = useUpdatingProfileStore((state) => state.addressLine1);
  const addressLine2 = useUpdatingProfileStore((state) => state.addressLine2);
  const dist = useUpdatingProfileStore((state) => state.dist);
  const state = useUpdatingProfileStore((state) => state.state);
  const country = useUpdatingProfileStore((state) => state.country);
  const pinCode = useUpdatingProfileStore((state) => state.pinCode);
  const citizenship = useUpdatingProfileStore((state) => state.citizenship);
  const ancestralOrigin = useUpdatingProfileStore((state) => state.ancestralOrigin);
  const whatsappNumber = useUpdatingProfileStore(
    (state) => state.whatsappNumber,
  );
  const alternatePhone = useUpdatingProfileStore(
    (state) => state.alternatePhone,
  );
  const emailId = useUpdatingProfileStore((state) => state.emailId);
  const phoneNumber = useUpdatingProfileStore((state) => state.phoneNumber);
  const relationshipWithBrideGroom = useUpdatingProfileStore((state) => state.relationshipWithBrideGroom);

  const setData = useUpdatingProfileStore((state) => state.setData);

  const form = useForm<any>({
    resolver: zodResolver(
      profileContactSchema,
    ) as unknown as Resolver<ProfileContactSchema>,
    defaultValues: {
      addressLine1: addressLine1 ? addressLine1 : "",
      addressLine2: addressLine2 ? addressLine2 : "",
      dist: dist ? dist : "",
      state: state ? state : "",
      country: country ? country : "",
      pinCode: pinCode ? pinCode : "",
      citizenship: citizenship ? citizenship : "",
      ancestralOrigin: ancestralOrigin ? ancestralOrigin : "",
      whatsappNumber: whatsappNumber ? whatsappNumber : "",
      alternatePhone: alternatePhone ? alternatePhone : "",
      emailId: emailId ? emailId : "",
      phoneNumber: phoneNumber ? phoneNumber : "",
      relationshipWithBrideGroom: relationshipWithBrideGroom ? relationshipWithBrideGroom : "",
    },
  });

  const onSubmit = (data: ProfileContactSchema) => {
    setLoading(true);
    setData(data);
    router.push("/users/account/complete/others");
  };

  return (
    <div className={"flex flex-1 flex-col"}>
      <DashboardHeader
        title={
          <div className="w-full flex items-center justify-center gap-2 bg-primary/20 p-4 md:p-6">
            <h1 className="font-semibold text-xl">Update Profile</h1>
          </div>
        }
      />
      <div className="flex flex-col flex-1 p-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 bg-card rounded-2xl shadow-md p-6"
          >
            {/* Title */}
            <div className="space-y-1  border-b pb-3">
              <h1 className="text-lg font-semibold text-primary">
                Contact Details
              </h1>
              <p className="text-sm text-muted-foreground">
                Please provide your complete and accurate contact details.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
                My Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Country <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. India" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        State <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. West Bengal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        District <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Kolkata" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Town / Village (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Salt Lake" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="citizenship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Citizenship (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Indian" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ancestralOrigin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ancestral Origin (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Bangladesh" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postOffice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Office (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Post Office" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="policeStation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Police Station (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Police Station" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pinCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pin Code (Recommended)</FormLabel>
                      <FormControl>
                        <Input type="address" inputMode="numeric" maxLength={6} placeholder="Pin Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* My Contact Section */}
            <div className="space-y-4 pt-4">
              <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
                My Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emailId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email ID (Recommended)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="e.g. name@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone Number (OTP Verified Recommended) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex rounded-md shadow-xs">
                          <span className="border-input bg-background text-muted-foreground inline-flex items-center rounded-s-md border px-3 text-sm">
                            +91
                          </span>
                          <Input
                            type="tel"
                            inputMode="tel"
                            className="-ms-px rounded-s-none shadow-none"
                            maxLength={10}
                            minLength={10}
                            placeholder="Primary Phone Number"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Whatsapp Number (Optional)</FormLabel>
                      <FormControl>
                        <div className="flex rounded-md shadow-xs">
                          <span className="border-input bg-background text-muted-foreground inline-flex items-center rounded-s-md border px-3 text-sm">
                            +91
                          </span>
                          <Input
                            type="tel"
                            inputMode="tel"
                            className="-ms-px rounded-s-none shadow-none"
                            maxLength={10}
                            minLength={10}
                            placeholder="Write your whatsapp number"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alternatePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternate Number (Optional)</FormLabel>
                      <FormControl>
                        <div className="flex rounded-md shadow-xs">
                          <span className="border-input bg-background text-muted-foreground inline-flex items-center rounded-s-md border px-3 text-sm">
                            +91
                          </span>
                          <Input
                            type="tel"
                            inputMode="tel"
                            className="-ms-px rounded-s-none shadow-none"
                            maxLength={10}
                            minLength={10}
                            placeholder="Write your alternate number"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="relationshipWithBrideGroom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Relationship with Bride/Groom <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Self, Parent, Sibling"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full"
                onClick={() => router.back()}
              >
                <>
                  <ArrowLeft className="h-4 w-4" />
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
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Continue</span>
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
