"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { registerUserSchema } from "@/schema/authUserSchema";
import SubmitLoadingView from "@/components/submitLoadingView";
import InputEmail from "@/components/ui-custom/input/input-email";
import PasswordInputWithValidation from "@/components/ui-custom/input/password-input-with-validation";
import RadioCustom from "@/components/ui-custom/radio-custom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getPlans } from "@/actions/get-plans";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { isAxiosError } from "axios";
import { KeyRound, Mars, Venus, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/ui-custom/input/password-input";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

const genderOptions = [
  {
    value: "MALE",
    label: "Male",
    icon: Mars,
    textColor: "text-blue-400",
  },
  {
    value: "FEMALE",
    label: "Female",
    icon: Venus,
    textColor: "text-pink-400",
  },
];

type CustomSignUpInput = Parameters<typeof authClient.signUp.email>[0] & {
  title: string;
  middleName?: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
};

export default function RegisterClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  //   const [isDark, setisDark] = useState(false);
  //   const { resolvedTheme } = useTheme();

  //   useEffect(() => {
  //     setisDark(resolvedTheme === "dark");
  //   }, [resolvedTheme]);

  const { data: plans, refetch } = useQuery({
    queryKey: ["plans"],
    queryFn: () => getPlans(),
  });

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<z.infer<typeof registerUserSchema> | null>(null);
  const [selectedFreePlan, setSelectedFreePlan] = useState<any>(null);

  const form = useForm<z.infer<typeof registerUserSchema>>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "MALE",
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const onSubmit = async (data: z.infer<typeof registerUserSchema>) => {
    try {
      // Force a direct fetch bypassing React Query cache entirely
      const freshPlans = await getPlans();
      const currentPlans = freshPlans || plans || [];
      const freePlan = currentPlans.find(p => String(p.price) === "0" || p.title.toLowerCase().includes("free"));
      
      if (data.gender === "MALE" && freePlan) {
        setFormData(data);
        setSelectedFreePlan(freePlan);
        setStep(2);
        return;
      }
    } catch (error) {
      console.error("Failed to fetch plans on submit:", error);
    }
    await handleCreateAccount(data);
  };

  const handleCreateAccount = async (data: z.infer<typeof registerUserSchema>) => {
    setLoading(true);
    const email =
      data.email?.trim() === "" ||
      data.email === undefined ||
      data.email === null ||
      data.email === "null"
        ? `${data.firstName}${data.middleName ?? ""}${data.lastName}${
            data.mobile
          }@example.com`
        : data.email;
    try {
      const response = await authClient.signUp.email({
        title: data.gender === "MALE" ? "Mr." : "Miss",
        email: email,
        name: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        gender: data.gender,
        phone: data.mobile,
        password: data.password,
        username: data.mobile,
        displayUsername: data.mobile,
      } as CustomSignUpInput);

      if (response.data?.user && !response.error) {
        toast.success("Account created successfully");
        router.replace("/users/home");
      } else {
        toast.error(response.error?.message || "Failed to create account");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      const errorMessage = isAxiosError(error)
        ? error?.response?.data?.message || "Failed to create account"
        : "Something went wrong";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  if (step === 2 && formData && selectedFreePlan) {
    return (
      <div className="flex flex-col p-6 md:p-4 lg:p-6 w-full sm:max-w-md md:max-w-lg items-center justify-center">
        <div className="flex flex-col items-center gap-2 py-5 mb-4 text-center">
          <h1 className="text-3xl font-bold">Choose Your Plan</h1>
          <p className="text-muted-foreground text-sm w-full">
            Great! Since you are registering, we have a special free plan available for you to get started immediately.
          </p>
        </div>
        
        <div className="w-full max-w-sm rounded-3xl border bg-gradient-to-b from-card/80 to-card shadow-lg p-6 flex flex-col gap-6 items-center">
           <h2 className="text-2xl font-bold tracking-tight">{selectedFreePlan.title}</h2>
           <div className="text-4xl font-semibold text-primary px-4 py-2 bg-primary/10 rounded-full">₹{selectedFreePlan.price}</div>
           <ul className="space-y-4 w-full text-left mt-2">
              <li className="flex items-center gap-3 text-muted-foreground"><CheckCircle2 className="w-6 h-6 text-primary shrink-0" /> <span className="font-medium text-foreground">Valid for {selectedFreePlan.duration} days</span></li>
              <li className="flex items-center gap-3 text-muted-foreground"><CheckCircle2 className="w-6 h-6 text-primary shrink-0" /> <span className="font-medium text-foreground">Connect up to {selectedFreePlan.connection} brides</span></li>
           </ul>
           <Button
             className="mt-6 w-full rounded-full py-6 text-lg font-medium bg-gradient-to-r from-rose-600 to-primary shadow-md hover:shadow-lg transition-all"
             disabled={loading}
             onClick={() => handleCreateAccount(formData)}
           >
             {loading ? <SubmitLoadingView text="Activating..." /> : "Activate Free Plan"}
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 md:p-4 lg:p-6 w-full sm:max-w-md md:max-w-lg">
      <div className={"flex flex-col items-center gap-2 py-5 mb-4"}>
        <h1 className={"text-3xl font-bold"}>Create a free account</h1>
        <p
          className={
            "text-muted-foreground text-sm w-full md:w-2/3 text-center"
          }
        >
          You can always upgrade later if you want to use premium features and
          complete your profile information by upgrading.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col sm:flex-row items-start justify-center gap-4 md:gap-2">
            <FormField
              name="firstName"
              render={({ field }) => (
                <FormItem className="w-full">
                  <Label htmlFor={field.name} className="mb-2">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <FormControl>
                    <Input
                      inputMode="text"
                      placeholder="Enter your first name"
                      type="text"
                      enterKeyHint="next"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="middleName"
              render={({ field }) => (
                <FormItem className="w-full">
                  <Label htmlFor={field.name} className="mb-2">
                    Middle Name
                  </Label>
                  <FormControl>
                    <Input
                      placeholder="Enter your middle name"
                      type="text"
                      inputMode="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor={field.name} className="mb-2">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <FormControl>
                  <Input
                    placeholder="Enter your last name"
                    type="text"
                    inputMode="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Gender */}
          <FormField
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Gender <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <RadioCustom field={field} items={genderOptions} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mobile */}
          <FormField
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Mobile Number <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="flex rounded-md shadow-xs">
                    <span className="border-input inline-flex items-center rounded-s-md border px-3 text-sm">
                      +91
                    </span>
                    <Input
                      className="rounded-s-none shadow-none"
                      placeholder="Enter your mobile number"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Email Address{" "}
                  <span className="text-muted-foreground">(Optional)</span>
                </FormLabel>
                <FormControl>
                  <InputEmail
                    field={field}
                    placeholder="Enter your email address"
                    areaInvalid={fieldState.invalid}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Password <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <PasswordInputWithValidation
                    field={field}
                    placeholder="Create a strong password"
                    isIcon
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Confirm Password <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <PasswordInput
                      field={field}
                      placeholder="Re-enter your password"
                      isIcon
                    />
                    <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                      <KeyRound size={16} aria-hidden="true" />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            className="w-full rounded-full h-11 font-semibold"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <SubmitLoadingView text="Creating Account..." />
            ) : (
              "Create Account"
            )}
          </Button>

          <div className={"w-full flex items-center justify-center"}>
            <p className={"text-center text-sm text-muted-foreground w-4/5"}>
              By clicking Create Account, you agree to our{" "}
              <Link
                href="/policies/terms"
                className={
                  "underline underline-offset-4 hover:text-primary transition-colors duration-300"
                }
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/policies/privacy"
                className={
                  "underline underline-offset-4 hover:text-primary transition-colors duration-300"
                }
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
