"use client";

import ButtonLoading from "@/components/buttonLoading";
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
import { cn } from "@/lib/utils";
import { updateProfileSchema } from "@/schema/ghotok/updateProfileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO, subYears } from "date-fns";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Resolver, useForm, useWatch } from "react-hook-form";
import z from "zod";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { loadGhotokUserProfileForEdit } from "@/actions/ghotok";
import LoadingPage from "@/components/loader";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EditUserProfileClient({
  userId,
  gender,
}: {
  userId: string;
  gender: string;
}) {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const hasResetRef = useRef(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["loadGhotokUserProfileForEdit", userId],
    queryFn: () => loadGhotokUserProfileForEdit(userId),
  });

  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema) as unknown as Resolver<
      z.infer<typeof updateProfileSchema>
    >,
    defaultValues: {
      isGhotokOwned: true,
      // isProfilePublic: true,
      // allowSocialPublish: false,
      dob: "",
      maritalStatus: "",
      bloodGroup: "",
      children: 0,
      speciallyAble: false,
      religion: "",
      gotra: "",
      caste: "",
      subCaste: "",
      manglik: false,
      height: "",
      weight: "",
      skinTone: "",
      bodyType: "",
      eatingHabits: "",
      drinkingHabits: "",
      smokingHabits: "",
      addressLine1: "",
      addressLine2: "",
      postOffice: "",
      policeStation: "",
      dist: "",
      state: "",
      pinCode: "",
      whatsappNumber: "",
      alternatePhone: "",
      aboutMyself: "",
      profession: "",
      education: "",
      hobbies: "",
      monthlyIncome: "",
      languages: "",
      familyMembers: "",
      fatherProfession: "",
      candidatePreferences: "",
      locationPreferences: "",
      aboutMyPartner: "",
    },
  });

  useEffect(() => {
    if (!data || hasResetRef.current) return;
    hasResetRef.current = true;

    // Map all data fields, ensuring proper null handling
    const formData = {
      // isProfilePublic: data.isProfilePublic ?? false,
      // allowSocialPublish: data.allowSocialPublish ?? false,
      dob: data.dob ?? "",
      maritalStatus: data.maritalStatus ?? "",
      bloodGroup: data.bloodGroup ?? "",
      children: data.children ?? 0,
      speciallyAble: data.speciallyAble || false,
      religion: data.religion ?? "",
      gotra: data.gotra || "",
      caste: data.caste ?? "",
      subCaste: data.subCaste || "",
      manglik: data.manglikDosh || false,
      height: data.height || "",
      weight: data.weight || "",
      skinTone: data.skinTone ?? "",
      bodyType: data.bodyType ?? "",
      eatingHabits: data.eatingHabits || "",
      drinkingHabits: data.drinkingHabits || "",
      smokingHabits: data.smokingHabits || "",
      addressLine1: data.addressLine1 || "",
      addressLine2: data.addressLine2 || "",
      postOffice: data.postOffice || "",
      policeStation: data.policeStation || "",
      dist: data.dist || "",
      state: data.state || "",
      pinCode: data.pinCode || "",
      whatsappNumber: data.whatsappNumber || "",
      alternatePhone: data.alternatePhone || "",
      aboutMyself: data.aboutMyself || "",
      profession: data.profession || "",
      education: data.education || "",
      hobbies: data.hobbies || "",
      monthlyIncome: data.monthlyIncome ?? "",
      languages: data.language || "",
      familyMembers: data.familyMembers || "",
      fatherProfession: data.fatherProfession || "",
      candidatePreferences: data.candidatePreference || "",
      locationPreferences: data.locationPreference || "",
      aboutMyPartner: data.aboutMyPartner || "",
    };

    // Reset form with mapped data
    form.reset(formData);
    setDataLoaded(true);
  }, [data, form]);

  const maritalStatus = useWatch({
    control: form.control,
    name: "maritalStatus",
  });

  async function onSubmit(data: z.infer<typeof updateProfileSchema>) {
    setLoading(true);
    try {
      const response = await api.post<AxiosResponse<null>>(
        `/app/ghotok/users/update/${userId}`,
        data
      );
      if (response.data.success) {
        form.reset();
        toast.success("Profile updated successfully");
        router.push(
          `/dashboard/ghotok/users/${userId}/upload?gender=${gender}`
        );
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data.message
        : "Something went wrong";
      toast.error(errorMessage);
    }
    setLoading(false);
  }

  if (isLoading) {
    <div className="flex flex-1 flex-col items-center justify-center">
      <LoadingPage />
    </div>;
  }
  return (
    <div className={"flex max-w-lg flex-col gap-4 p-4"}>
      <Form {...form} key={dataLoaded ? "loaded" : "loading"}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-card space-y-6 overflow-y-auto rounded-2xl p-6 shadow-md"
        >
          <h1 className="text-primary border-b pb-3 text-xl font-bold">
            Personal Details
          </h1>

          {/* Section: Basic Info */}
          <div className="space-y-6">
            <h2 className="text-muted-foreground text-lg font-semibold">
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
                              !field.value && "text-muted-foreground"
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
                      value={field.value ?? ""}
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

                        {/* Always render, but control selection by logic */}
                        <SelectItem value="WIDOWED">WIDOWED</SelectItem>
                        <SelectItem value="WIDOWER">WIDOWER</SelectItem>
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

          {/* Section: Background */}
          <div className="space-y-6">
            <h2 className="text-muted-foreground text-lg font-semibold">
              Background Information
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Blood Group */}
              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group</FormLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
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
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Religion */}
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
                    <FormLabel>Gotra</FormLabel>
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
                      Caste <span className="text-destructive">*</span>
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
                  <FormLabel>Sub Caste</FormLabel>
                  <FormControl>
                    <Input placeholder="Write your sub caste" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <FormLabel className="pb-2">Manglik</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(val) => field.onChange(val === "true")}
                        value={field.value ? "true" : "false"}
                        className="flex flex-wrap gap-2"
                      >
                        {items.map((item) => (
                          <div
                            key={`${id}-${item.value}`}
                            className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none"
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

          {/* Section: Physical Attributes */}
          <div className="space-y-6">
            <h2 className="text-muted-foreground text-lg font-semibold">
              Physical Attributes
            </h2>
            <FormField
              control={form.control}
              name="speciallyAble"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Are you specially abled?
                    <span className="text-destructive">*</span>
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
                        <div className="h-6 w-6 rounded-full bg-[#f8d2b3]" />
                        Light
                      </SelectItem>
                      <SelectItem value="Fair">
                        <div className="h-6 w-6 rounded-full bg-[#ebb68f]" />
                        Fair
                      </SelectItem>
                      <SelectItem value="Medium">
                        <div className="h-6 w-6 rounded-full bg-[#cfa07c]" />
                        Medium
                      </SelectItem>
                      <SelectItem value="Tan">
                        <div className="h-6 w-6 rounded-full bg-[#bd7852]" />
                        Tan
                      </SelectItem>
                      <SelectItem value="Brown">
                        <div className="h-6 w-6 rounded-full bg-[#90493d]" />
                        Brown
                      </SelectItem>
                      <SelectItem value="Dark">
                        <div className="h-6 w-6 rounded-full bg-[#3c1f1b]" />
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
                    value={field.value ?? ""}
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

            <FormField
              control={form.control}
              name="eatingHabits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eating Habits</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
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
                    value={field.value ?? ""}
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
                    value={field.value ?? ""}
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

          {/* Title */}
          <div className="space-y-1 border-b pb-3">
            <h1 className="text-primary text-lg font-semibold">
              Contact Details
            </h1>
            <p className="text-muted-foreground text-sm">
              Please provide your complete and accurate contact details.
            </p>
          </div>

          <FormField
            control={form.control}
            name="addressLine1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Village / Town <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="address"
                    inputMode="text"
                    placeholder="Village, Road or Street Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="addressLine2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apartment</FormLabel>
                <FormControl>
                  <Input
                    type="address"
                    inputMode="text"
                    placeholder="Apartment, Suite, Unit, Building, Floor, etc"
                    {...field}
                  />
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
                <FormLabel>
                  Post Office <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="address"
                    inputMode="text"
                    placeholder="Post Office"
                    {...field}
                  />
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
                <FormLabel>
                  Police Station <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="address"
                    inputMode="text"
                    placeholder="Police Station"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dist"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  District <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter your district"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  State <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter your state"
                    {...field}
                  />
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
                <FormLabel>
                  Pin Code <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="address"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Pin Code"
                    {...field}
                  />
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
                <FormLabel>Whatsapp Number</FormLabel>
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
                <FormLabel>Alternate Number</FormLabel>
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

          {/* Title */}
          <div className="space-y-1 border-b pb-3">
            <h1 className="text-primary text-lg font-semibold">
              Other Details
            </h1>
            <p className="text-muted-foreground text-sm">
              Please provide your details below.
            </p>
          </div>

          <FormField
            control={form.control}
            name="aboutMyself"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>About Myself</FormLabel>
                <FormControl>
                  <Textarea
                    inputMode="text"
                    placeholder="Write about yourself here..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="profession"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  Occupation / Profession{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="text"
                    placeholder="Write your profession"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="education"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Education <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="text"
                    placeholder="Write your higher education"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hobbies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hobbies</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="text"
                    placeholder="Write your hobbies"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyIncome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Income</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
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

          <FormField
            control={form.control}
            name="familyMembers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How many family members do you have?</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="text"
                    placeholder="Enter number of family members"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fatherProfession"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father&apos;s Profession</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="text"
                    placeholder="Write your fathers profession"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="candidatePreferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What is your preferred profession?</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="text"
                    placeholder="Enter preferred profession"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationPreferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What is your preferred location?</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="text"
                    placeholder="Enter preferred location"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aboutMyPartner"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>About My Partner</FormLabel>
                <FormControl>
                  <Textarea
                    inputMode="text"
                    placeholder="Write about your partner preferences"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name="isProfilePublic"
            render={({ field }) => (
              <FormItem className="hover:bg-primary/20 has-[[aria-checked=true]]:border-primary dark:has-[[aria-checked=true]]:border-primary/30 dark:has-[[aria-checked=true]]:bg-primary/20 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:bg-blue-50">
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
          /> */}

          {/* <FormField
            control={form.control}
            name="allowSocialPublish"
            render={({ field }) => (
              <FormItem className="hover:bg-primary/20 has-[[aria-checked=true]]:border-primary dark:has-[[aria-checked=true]]:border-primary/30 dark:has-[[aria-checked=true]]:bg-primary/20 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:bg-blue-50">
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
          /> */}

          <Button
            type="submit"
            className="w-full rounded-2xl"
            disabled={loading}
          >
            {loading ? (
              <ButtonLoading text="Saving..." />
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Save & Next
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
