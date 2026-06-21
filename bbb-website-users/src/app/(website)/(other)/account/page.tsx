"use client";

import LoadingPage from "@/components/loader";
import SubmitLoadingView from "@/components/submitLoadingView";
import InputEmail from "@/components/ui-custom/input/input-email";
import PasswordInput from "@/components/ui-custom/input/password-input";
import PasswordInputWithValidation from "@/components/ui-custom/input/password-input-with-validation";
import RadioCustom from "@/components/ui-custom/radio-custom";
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
import { authClient } from "@/lib/auth-client";
import { useCreateAccountStore } from "@/lib/createAccountStore";
import { registerUserHalfSchema } from "@/schema/authUserSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import axiosInstance from "@/lib/axiosInstance";
import { KeyRound, Mars, Venus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

type CustomSignUpInput = Parameters<typeof authClient.signUp.email>[0] & {
  title: string;
  middleName?: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
};

export default function AccountPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  
  // OTP States
  const [emailOtp, setEmailOtp] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [accountData, setAccountData] = useState<any>(null); // store form data temporarily

  const firstName = useCreateAccountStore((state) => state.firstName?.trim());
  const middleName = useCreateAccountStore((state) => state.middleName?.trim());
  const lastName = useCreateAccountStore((state) => state.lastName?.trim());
  const gender = useCreateAccountStore((state) => state.gender);
  const mobile = useCreateAccountStore((state) => state.mobile?.trim());
  const emailVal = useCreateAccountStore((state) => state.email?.trim());
  const hydrated = useCreateAccountStore((s) => s.hydrated);

  const form = useForm<z.infer<typeof registerUserHalfSchema>>({
    resolver: zodResolver(registerUserHalfSchema),
    defaultValues: {
      gender: gender || "MALE",
      email: emailVal || "",
      mobile: mobile || "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!hydrated) return; // Wait until rehydrated
    if (!firstName || !lastName) {
      router.replace("/");
    } else {
      setIsChecking(false);
    }
  }, [firstName, lastName, router, hydrated]);

  if (isChecking) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  const onSubmit = async (data: z.infer<typeof registerUserHalfSchema>) => {
    setLoading(true);
    const email = data.email
      ? data.email
      : `${firstName}${middleName ?? ""}${lastName}${data.mobile}@example.com`;
    
    // Store the computed email back to the store so we have it for final submission
    useCreateAccountStore.getState().setData({ email });
    
    // In Approach 2, we DO NOT create the account yet.
    // Instead, we save the password securely to sessionStorage and proceed to the public setup wizard.
    const { setPassword } = await import("@/lib/passwordStore").then(m => m.usePasswordStore.getState());
    setPassword(data.password);
    
    // If OTP was verified previously, we can skip verificationStep and directly go to setup
    // But if we need to verify OTP here, we should set verification step.
    // Wait, the previous page already verifies OTP before they reach /account. 
    // The code says "Create account directly since OTP is already verified on the previous page".
    
    toast.success("Password set successfully. Please complete your profile.");
    router.replace("/account/setup");
  };

  const handleVerifyOTP = async () => {
    if (!emailOtp || !mobileOtp) {
      toast.error("Please enter both email and mobile OTPs.");
      return;
    }

    setLoading(true);
    try {
      // Verify Email OTP
      await axiosInstance.post("/api/v1/auth/verify-otp", {
        type: "email",
        target: accountData.computedEmail,
        otp: emailOtp,
      });

      // Verify Mobile OTP
      await axiosInstance.post("/api/v1/auth/verify-otp", {
        type: "mobile",
        target: accountData.mobile,
        otp: mobileOtp,
      });

      // Both verified successfully, but we delay account creation.
      // Save password and move to setup wizard.
      const { setPassword } = await import("@/lib/passwordStore").then(m => m.usePasswordStore.getState());
      setPassword(accountData.password);
      
      toast.success("Verification successful. Please complete your profile.");
      router.replace("/account/setup");
    } catch (error) {
      console.log(error);
      const errorMessage = isAxiosError(error)
        ? error?.response?.data?.message || "Invalid OTP. Please try again."
        : "Failed to verify OTP";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-8">
      <div className="w-full md:max-w-md bg-card border rounded-2xl shadow-lg p-6 space-y-5">
        
        {!verificationStep ? (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Almost There</h1>
              <p className="text-sm text-muted-foreground">
                Set a strong password to continue
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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

                <Button
                  className="w-full rounded-full h-11 font-semibold"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <SubmitLoadingView text="Sending OTPs..." />
                  ) : (
                    "Continue to Verification"
                  )}
                </Button>
                
                <div className={"w-full flex items-center justify-center"}>
                  <p className={"text-center text-sm text-muted-foreground w-4/5"}>
                    By continuing, you agree to our{" "}
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
          </>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Verify Your Account</h1>
              <p className="text-sm text-muted-foreground">
                We've sent OTPs to your email and mobile.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email OTP</label>
                <Input 
                  value={emailOtp} 
                  onChange={(e) => setEmailOtp(e.target.value)} 
                  placeholder="Enter 6-digit email OTP"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mobile OTP</label>
                <Input 
                  value={mobileOtp} 
                  onChange={(e) => setMobileOtp(e.target.value)} 
                  placeholder="Enter 6-digit mobile OTP"
                  maxLength={6}
                />
              </div>

              <Button
                className="w-full rounded-full h-11 font-semibold mt-4"
                onClick={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? (
                  <SubmitLoadingView text="Verifying..." />
                ) : (
                  "Verify & Create Account"
                )}
              </Button>
              
              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => setVerificationStep(false)}
                  className="text-sm text-primary underline mt-2 hover:text-red-600 transition"
                >
                  Go Back
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
