"use client";

import { UserType } from "@/components/enum/userType";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { profileOtherSchema } from "@/schema/updateProfileSchema";
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
// removed useAuthSession
import DashboardHeader from "@/components/dashboard/header";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ProfileOtherSchema = z.infer<typeof profileOtherSchema>;

export default function OthersProfilePage() {
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

  // allow free users as well

  return (
    <div className="flex flex-col flex-1">
      <OtherDetailsPage />
    </div>
  );
}

function OtherDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const dob = useUpdatingProfileStore((state) => state.dob);
  const maritalStatus = useUpdatingProfileStore((state) => state.maritalStatus);
  const children = useUpdatingProfileStore((state) => state.children);
  const bloodGroup = useUpdatingProfileStore((state) => state.bloodGroup);
  const religion = useUpdatingProfileStore((state) => state.religion);
  const gotra = useUpdatingProfileStore((state) => state.gotra);
  const caste = useUpdatingProfileStore((state) => state.caste);
  const subCaste = useUpdatingProfileStore((state) => state.subCaste);
  const manglik = useUpdatingProfileStore((state) => state.manglik);
  const speciallyAble = useUpdatingProfileStore((state) => state.speciallyAble);
  const height = useUpdatingProfileStore((state) => state.height);
  const weight = useUpdatingProfileStore((state) => state.weight);
  const skinTone = useUpdatingProfileStore((state) => state.skinTone);
  const bodyType = useUpdatingProfileStore((state) => state.bodyType);
  const eatingHabits = useUpdatingProfileStore((state) => state.eatingHabits);
  const myFamilyValues = useUpdatingProfileStore(
    (state) => state.myFamilyValues,
  );
  const familyDescription = useUpdatingProfileStore((state) => state.familyDescription);
  const familyBackground = useUpdatingProfileStore((state) => state.familyBackground);
  const culturalValues = useUpdatingProfileStore((state) => state.culturalValues);

  const isProfilePublic = useUpdatingProfileStore((state) => state.isProfilePublic);
  const addressLine1 = useUpdatingProfileStore((state) => state.addressLine1);
  const addressLine2 = useUpdatingProfileStore((state) => state.addressLine2);
  const postOffice = useUpdatingProfileStore((state) => state.postOffice);
  const policeStation = useUpdatingProfileStore((state) => state.policeStation);
  const dist = useUpdatingProfileStore((state) => state.dist);
  const state = useUpdatingProfileStore((state) => state.state);
  const pinCode = useUpdatingProfileStore((state) => state.pinCode);
  const whatsappNumber = useUpdatingProfileStore(
    (state) => state.whatsappNumber,
  );
  const alternatePhone = useUpdatingProfileStore(
    (state) => state.alternatePhone,
  );

  const form = useForm<ProfileOtherSchema>({
    resolver: zodResolver(
      profileOtherSchema,
    ) as unknown as Resolver<ProfileOtherSchema>,
    defaultValues: {
      aboutMyself: "",
      personalityTraits: "",
      lifeGoals: "",
      employmentType: "",
      profession: "",
      occupationDetails: "",
      designation: "",
      workExperience: "",
      organizationName: "",
      companyName: "",
      education: "",
      collegeInstitution: "",
      fieldOfStudy: "",
      passingYear: "",
      hobbies: "",
      monthlyIncome: "",
      languages: "",
      fathersOccupation: "",
      mothersOccupation: "",
      noOfBrothers: "",
      brothersMarriedCount: "",
      noOfSisters: "",
      sistersMarriedCount: "",
      myFamilyStatus: "",
      myFamilyType: "",
      myFamilyValues: "",
      familyDescription: "",
      familyBackground: "",
      culturalValues: "",
      isProfilePublic: true,
      allowSocialPublish: false,
    },
  });

  const setData = useUpdatingProfileStore((state) => state.setData);

  const onSubmit = async (data: ProfileOtherSchema) => {
    setData(data);
    router.push("/account/setup/partner-preference");
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
      <div className="flex flex-col flex-1">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 bg-card rounded-2xl shadow-md p-6"
          >
            {/* Title */}
            <div className="space-y-1  border-b pb-3">
              <h1 className="text-lg font-semibold text-primary">
                Other Details
              </h1>
              <p className="text-sm text-muted-foreground">
                Please provide your details below.
              </p>
            </div>

            {/* About Myself Section */}
            <div className="space-y-4 pt-4">
              <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
                About Myself
              </h2>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="aboutMyself"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Description (Recommended)</FormLabel>
                      <FormControl>
                        <Textarea
                          inputMode="text"
                          placeholder="Write about yourself (500-1000 Characters)..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="personalityTraits"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Personality Traits (Recommended)</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="text"
                          placeholder="e.g. Introvert, Ambivert, Extrovert"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lifeGoals"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Life Goals (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="text"
                          placeholder="Write about your life goals"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* My Professional Section */}
            <div className="space-y-4 pt-4">
              <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
                My Professional
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Employment Type <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Private Job, Govt Job, Self Employed" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Occupation <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Software Engineer, Doctor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="occupationDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation Details (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Backend Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Experience (Years) (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 5" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Tata Consultancy Services" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company / Business Name (Recommended)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. XYZ Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* My Education Section */}
            <div className="space-y-4 pt-4">
              <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
                My Education
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Highest Qualification <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="text"
                          placeholder="e.g. Master's Degree"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="collegeInstitution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College / Institution (Recommended)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="text"
                          placeholder="e.g. XYZ University"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fieldOfStudy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field of Study (Recommended)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="text"
                          placeholder="e.g. Computer Science"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="passingYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passing Year (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="e.g. 2021"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* My Hobbies & Interests Section */}
            <div className="space-y-4 pt-4">
              <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
                My Hobbies & Interests
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="hobbies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hobbies (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="text"
                          placeholder="e.g. Reading, Traveling, Photography"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="monthlyIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Income</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select your income" />
                      </SelectTrigger>
                    </FormControl>
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
                        <SelectItem value="10 - 15 lakh">
                          10 - 15 lakh
                        </SelectItem>
                      </SelectGroup>

                      <SelectGroup>
                        <SelectLabel>15 lakh to 50 lakh</SelectLabel>
                        <SelectItem value="15 - 20 lakh">
                          15 - 20 lakh
                        </SelectItem>
                        <SelectItem value="20 - 25 lakh">
                          20 - 25 lakh
                        </SelectItem>
                        <SelectItem value="25 - 30 lakh">
                          25 - 30 lakh
                        </SelectItem>
                        <SelectItem value="30 - 35 lakh">
                          30 - 35 lakh
                        </SelectItem>
                        <SelectItem value="35 - 40 lakh">
                          35 - 40 lakh
                        </SelectItem>
                        <SelectItem value="40 - 45 lakh">
                          40 - 45 lakh
                        </SelectItem>
                        <SelectItem value="45 - 50 lakh">
                          45 - 50 lakh
                        </SelectItem>
                      </SelectGroup>

                      <SelectGroup>
                        <SelectLabel>50 lakh to 1 crore</SelectLabel>
                        <SelectItem value="50 - 55 lakh">
                          50 - 55 lakh
                        </SelectItem>
                        <SelectItem value="55 - 60 lakh">
                          55 - 60 lakh
                        </SelectItem>
                        <SelectItem value="60 - 65 lakh">
                          60 - 65 lakh
                        </SelectItem>
                        <SelectItem value="65 - 70 lakh">
                          65 - 70 lakh
                        </SelectItem>
                        <SelectItem value="70 - 75 lakh">
                          70 - 75 lakh
                        </SelectItem>
                        <SelectItem value="75 - 80 lakh">
                          75 - 80 lakh
                        </SelectItem>
                        <SelectItem value="80 - 85 lakh">
                          80 - 85 lakh
                        </SelectItem>
                        <SelectItem value="85 - 90 lakh">
                          85 - 90 lakh
                        </SelectItem>
                        <SelectItem value="90 - 95 lakh">
                          90 - 95 lakh
                        </SelectItem>
                        <SelectItem value="95 lakh - 1 crore">
                          95 lakh - 1 crore
                        </SelectItem>
                        <SelectItem value="1 crore & above">
                          1 crore & above
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Which languages do you speak, read or write?
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="text"
                      placeholder="Write your languages"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Basic My Family Section */}
            <div className="space-y-4 pt-4">
              <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
                MY FAMILY DETAILS (Basic My Family)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="myFamilyStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Family Status <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Select Family Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Rich / Affluent">Rich / Affluent</SelectItem>
                          <SelectItem value="Upper Middle Class">Upper Middle Class</SelectItem>
                          <SelectItem value="Middle Class">Middle Class</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="myFamilyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Family Type <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Select Family Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Joint">Joint</SelectItem>
                          <SelectItem value="Nuclear">Nuclear</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="myFamilyValues"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family Values (Recommended)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Select Family Values" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Orthodox">Orthodox</SelectItem>
                          <SelectItem value="Traditional">Traditional</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="Liberal">Liberal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fathersOccupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Father&apos;s Occupation (Recommended)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g. Businessman, Retired" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mothersOccupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mother&apos;s Occupation (Recommended)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g. Homemaker, Teacher" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="noOfBrothers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. of Brothers (Recommended)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5+">5+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brothersMarriedCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Married / Unmarried Count (Optional)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g. 1 Married, 1 Unmarried" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="noOfSisters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. of Sisters (Recommended)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5+">5+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sistersMarriedCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Married / Unmarried Count (Optional)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g. 2 Unmarried" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* About My Family Section */}
            <div className="space-y-4 pt-4">
              <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
                About My Family
              </h2>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="familyDescription"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Family Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          inputMode="text"
                          placeholder="Write about your family..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="familyBackground"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Family Background (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="text"
                          placeholder="e.g. Business background, Service background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="culturalValues"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Cultural Values (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="text"
                          placeholder="Write about your cultural values"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>


            <FormField
              control={form.control}
              name="isProfilePublic"
              render={({ field }) => (
                <FormItem className="hover:bg-primary/20 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-primary/30 dark:has-[[aria-checked=true]]:bg-primary/20">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    <div className="grid gap-1.5 font-normal">
                      <p className="text-sm leading-none font-medium">
                        Public Profile Visibility
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Enable this option to make your profile visible on our
                        public landing page. This helps others discover you more
                        easily.
                      </p>
                    </div>
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowSocialPublish"
              render={({ field }) => (
                <FormItem className="hover:bg-primary/20 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-primary/30 dark:has-[[aria-checked=true]]:bg-primary/20">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    <div className="grid gap-1.5 font-normal">
                      <p className="text-sm leading-none font-medium">
                        Social Media Sharing
                      </p>
                      <p className="text-muted-foreground text-sm">
                        By selecting this option to allow your profile to be
                        shared on our social media platforms.
                      </p>
                    </div>
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-2">
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
