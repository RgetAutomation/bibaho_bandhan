"use client";

import ProfileCompletedComponent from "@/components/profile/profileCompletedComponent";
import { UserType } from "@/components/enum/userType";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdatingProfileStore } from "@/lib/updateProfileStore";
import { cn } from "@/lib/utils";
import { profilePersonalSchema } from "@/schema/updateProfileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO, subYears } from "date-fns";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import { Resolver, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { UserGender } from "@/components/enum/userGender";
import DashboardHeader from "@/components/dashboard/header";
import { LoadingButton } from "@/components/loadingButton";
import { useAuthSession } from "@/hooks/useAuthSession";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function CompleteProfilePage() {
  const { user } = useAuthSession();
  const userGender = user?.gender as UserGender;
  const userType = user?.type as UserType;

  // allow all users to complete their profile

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header fixed at top */}
      <DashboardHeader
        title={
          <div className="w-full flex items-center justify-center gap-2 bg-primary/20 p-4 md:p-6">
            <h1 className="font-semibold text-xl">Complete Profile</h1>
          </div>
        }
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {user?.isProfileComplete ? (
          <ProfileCompletedComponent />
        ) : (
          <ProfileCompleteForm userGender={userGender} />
        )}
      </div>
    </div>
  );
}

function ProfileCompleteForm({ userGender }: { userGender: UserGender }) {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const dob = useUpdatingProfileStore((state) => state.dob);
  const status = useUpdatingProfileStore((state) => state.maritalStatus);
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
  const smokingHabits = useUpdatingProfileStore((state) => state.smokingHabits);
  const drinkingHabits = useUpdatingProfileStore(
    (state) => state.drinkingHabits,
  );
  const disabilityDetails = useUpdatingProfileStore((state) => state.disabilityDetails);
  const healthScreening = useUpdatingProfileStore((state) => state.healthScreening);
  const rashi = useUpdatingProfileStore((state) => state.rashi);
  const nakshatra = useUpdatingProfileStore((state) => state.nakshatra);
  const timeOfBirth = useUpdatingProfileStore((state) => state.timeOfBirth);
  const cityOfBirth = useUpdatingProfileStore((state) => state.cityOfBirth);
  const countryOfBirth = useUpdatingProfileStore((state) => state.countryOfBirth);

  const setData = useUpdatingProfileStore((state) => state.setData);

  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof profilePersonalSchema>>({
    resolver: zodResolver(profilePersonalSchema) as unknown as Resolver<
      z.infer<typeof profilePersonalSchema>
    >,
    defaultValues: {
      dob: dob ? dob : "",
      maritalStatus: status ? status : "",
      children: children ? children : 0,
      speciallyAble: speciallyAble ? speciallyAble : false,
      religion: religion ? religion : "",
      gotra: gotra ? gotra : "",
      caste: caste ? caste : "",
      subCaste: subCaste ? subCaste : "",
      manglik: manglik ? manglik : false,
      height: height ? height : "",
      weight: weight ? weight : "",
      bloodGroup: bloodGroup ? bloodGroup : "",
      skinTone: skinTone ? skinTone : "",
      bodyType: bodyType ? bodyType : "",
      eatingHabits: eatingHabits ? eatingHabits : "",
      smokingHabits: smokingHabits ? smokingHabits : "",
      drinkingHabits: drinkingHabits ? drinkingHabits : "",
      disabilityDetails: disabilityDetails ? disabilityDetails : "",
      healthScreening: healthScreening ? healthScreening : "",
      rashi: rashi ? rashi : "",
      nakshatra: nakshatra ? nakshatra : "",
      timeOfBirth: timeOfBirth ? timeOfBirth : "",
      cityOfBirth: cityOfBirth ? cityOfBirth : "",
      countryOfBirth: countryOfBirth ? countryOfBirth : "",
    } as z.infer<typeof profilePersonalSchema>, // optional: helps TS ensure the shape matches
  });

  const maritalStatus = useWatch({
    control: form.control,
    name: "maritalStatus",
  });

  function onSubmit(data: z.infer<typeof profilePersonalSchema>) {
    setLoading(true);
    setData(data);
    router.push("/users/account/complete/contact");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 bg-card rounded-2xl shadow-md p-6 overflow-y-auto"
      >
        <h1 className="text-xl font-bold text-primary border-b pb-3">
          Personal Details
        </h1>

        {/* Section: Basic Info */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Basic Information
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* DOB */}
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Date of Birth <span className="text-destructive">*</span>
                  </FormLabel>
                  <Popover
                    open={openIndex === 0}
                    onOpenChange={(isOpen) => setOpenIndex(isOpen ? 0 : null)}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? format(field.value, "dd-MM-yyyy")
                            : "Select your date of birth"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? parseISO(field.value) : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date.toISOString());
                            setOpenIndex(null);
                          }
                        }}
                        disabled={(date) =>
                          date > new Date(subYears(new Date(), 18)) ||
                          date < new Date("1900-01-01")
                        }
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Marital Status */}
            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Marital Status <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select your marital status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NEVER MARRIED">
                        NEVER MARRIED
                      </SelectItem>
                      <SelectItem value="DIVORCED">DIVORCED</SelectItem>
                      {userGender === UserGender.FEMALE && (
                        <SelectItem value="WIDOWED">WIDOWED</SelectItem>
                      )}
                      {userGender === UserGender.MALE && (
                        <SelectItem value="WIDOWER">WIDOWER</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {maritalStatus && maritalStatus !== "NEVER MARRIED" && (
            <FormField
              control={form.control}
              name="children"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How many children?</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter number of children"
                      maxLength={2}
                      max={20}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>



        {/* Section: My Religious */}
        <div className="space-y-6">
          <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
            My Religious
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="religion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Religion <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select religion" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[
                        "HINDU",
                        "CHRISTIAN",
                        "MUSLIM",
                        "SIKH",
                        "BUDHIST",
                        "SARNAISM",
                        "JAIN",
                        "OTHER",
                      ].map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Gotra & Caste */}
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="gotra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gothra (Optional)</FormLabel>
                  <FormControl className="w-full">
                    <Input placeholder="Write your gotra" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="caste"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Caste (Recommended)
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select caste" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["GENERAL", "OBC", "SC", "ST", "OTHERS"].map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Sub Caste */}
          <FormField
            control={form.control}
            name="subCaste"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub Caste (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Write your sub caste" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        {/* Section: My Astrology */}
        <div className="space-y-6 pt-4">
          <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
            MY ASTROLOGY
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="rashi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rashi (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Write your Rashi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nakshatra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Star / Nakshatra (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Write your Nakshatra" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time of Birth (Optional)</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cityOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City of Birth (Recommended)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Kolkata" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="countryOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country of Birth (Recommended)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. India" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="manglik"
            render={({ field }) => {
              const id = "manglik";

              const items = [
                { label: "No, I'm not Manglik", value: "false" },
                { label: "Yes, I'm Manglik", value: "true" },
              ];

              return (
                <FormItem>
                  <FormLabel className="pb-2">Manglik Dosh (Optional)</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(val) => field.onChange(val === "true")}
                      value={field.value ? "true" : "false"}
                      className="flex flex-wrap gap-2"
                    >
                      {items.map((item) => (
                        <div
                          key={`${id}-${item.value}`}
                          className="relative flex flex-col items-start gap-4 rounded-md border border-input p-3 shadow-xs outline-none has-data-[state=checked]:border-primary/50"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem
                              id={`${id}-${item.value}`}
                              value={item.value}
                              className="after:absolute after:inset-0"
                            />
                            <Label htmlFor={`${id}-${item.value}`}>
                              {item.label}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Section: My Physical & Health */}
        <div className="space-y-6 pt-4">
          <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
            My Physical & Health
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="bloodGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Group (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                        (bg) => (
                          <SelectItem key={bg} value={bg}>
                            {bg}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="healthScreening"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Health Screening (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Tested & Clear">Tested & Clear</SelectItem>
                      <SelectItem value="Not Tested">Not Tested</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="speciallyAble"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Any Disability (Recommended)
                </FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "true")}
                  value={String(field.value)}
                >
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch("speciallyAble") && (
            <FormField
              control={form.control}
              name="disabilityDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Disability Details <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Please provide details" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select your height" />
                      </SelectTrigger>
                    </FormControl>
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
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (Kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="decimal"
                      inputMode="decimal"
                      placeholder="Write your weight"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="skinTone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skin Tone</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select your skin tone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Light">
                      <div className="bg-[#f8d2b3] h-6 w-6 rounded-full" />
                      Light
                    </SelectItem>
                    <SelectItem value="Fair">
                      <div className="bg-[#ebb68f] h-6 w-6 rounded-full" />
                      Fair
                    </SelectItem>
                    <SelectItem value="Medium">
                      <div className="bg-[#cfa07c] h-6 w-6 rounded-full" />
                      Medium
                    </SelectItem>
                    <SelectItem value="Tan">
                      <div className="bg-[#bd7852] h-6 w-6 rounded-full" />
                      Tan
                    </SelectItem>
                    <SelectItem value="Brown">
                      <div className="bg-[#90493d] h-6 w-6 rounded-full" />
                      Brown
                    </SelectItem>
                    <SelectItem value="Dark">
                      <div className="bg-[#3c1f1b] h-6 w-6 rounded-full" />
                      Dark
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bodyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select your body type" />
                    </SelectTrigger>
                  </FormControl>
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
            )}
          />
        </div>

        {/* Section: My Habits */}
        <div className="space-y-6 pt-4">
          <h2 className="text-md font-medium text-foreground bg-secondary/30 p-2 rounded-md">
            My Habits
          </h2>
          <div className="grid gap-6 md:grid-cols-3">

          <FormField
            control={form.control}
            name="eatingHabits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Eating Habits</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select your eating habits" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Non Vegetarian">
                      Non Vegetarian
                    </SelectItem>
                    <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="Eggetarian">Eggetarian</SelectItem>
                    <SelectItem value="Occasionally Non-Veg">
                      Occasionally Non-Veg
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="drinkingHabits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drinking Habits</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select your drinking habits" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="Occasionally">Occasionally</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="smokingHabits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Smoking Habits</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select your smoking habits" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="Occasionally">Occasionally</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
        </div>

        <Button type="submit" className="w-full rounded-2xl" disabled={loading}>
          {loading ? (
            <LoadingButton title="Saving..." />
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Save & Continue
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
