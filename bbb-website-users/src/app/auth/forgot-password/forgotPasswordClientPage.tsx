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
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail, ArrowRight, ArrowLeft, Key } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/ui-custom/input/password-input";
import { LoadingButton } from "@/components/loadingButton";
import { Input } from "@/components/ui/input";
import { detectIdentifierType } from "@/lib/utils";
import { MAIN_API_URL } from "@/lib/constant-data";

const Step1Schema = z.object({
  target: z.string().min(3, {
    message: "Email or Mobile is required",
  }),
});

const Step2Schema = z.object({
  otp: z.string().length(6, {
    message: "OTP must be 6 digits",
  }),
});

const Step3Schema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
  confirmPassword: z.string().min(8, {
    message: "Confirm Password is required",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ForgotPasswordClientPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState("");
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);


  const step1Form = useForm<z.infer<typeof Step1Schema>>({
    resolver: zodResolver(Step1Schema),
    defaultValues: { target: "" },
  });

  const step2Form = useForm<z.infer<typeof Step2Schema>>({
    resolver: zodResolver(Step2Schema),
    defaultValues: { otp: "" },
  });

  const step3Form = useForm<z.infer<typeof Step3Schema>>({
    resolver: zodResolver(Step3Schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onStep1Submit = async (data: z.infer<typeof Step1Schema>) => {
    setLoading(true);
    try {
      const inputType = detectIdentifierType(data.target);
      if (inputType === "INVALID") {
        toast.error("Invalid email or mobile number");
        setLoading(false);
        return;
      }

      const bodyData = inputType === "EMAIL" ? { email: data.target } : { mobile: data.target };

      const res = await fetch(`${MAIN_API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const response = await res.json();
      if (res.ok) {
        toast.success(response.message || "OTP sent successfully!");
        setTarget(data.target);
        setStep(2);
      } else {
        toast.error(response.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  
  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const inputType = detectIdentifierType(target);
      const bodyData = inputType === "EMAIL" ? { email: target } : { mobile: target };

      const res = await fetch(`${MAIN_API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const response = await res.json();
      if (res.ok) {
        toast.success("OTP resent successfully!");
        setOtpTimer(60);
      } else {
        toast.error(response.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setResendLoading(false);
    }
  };

  const onStep2Submit = async (data: z.infer<typeof Step2Schema>) => {
    setOtp(data.otp);
    setStep(3);
  };

  const onStep3Submit = async (data: z.infer<typeof Step3Schema>) => {
    setLoading(true);
    try {
      const res = await fetch(`${MAIN_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          otp,
          newPassword: data.password,
        }),
      });

      const response = await res.json();
      if (res.ok) {
        toast.success(response.message || "Password reset successfully!");
        router.push("/auth/login");
      } else {
        toast.error(response.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col p-5 sm:p-6 lg:p-8 w-full md:min-w-[420px] lg:min-w-[460px] max-w-[480px] mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col items-center justify-center text-center mb-6 mt-1">
        <div className="hidden sm:flex w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950 items-center justify-center mb-3 border border-rose-100 dark:border-rose-900">
          <Key className="w-6 h-6 text-[#E51E44] dark:text-rose-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#E51E44]">
          {step === 1 && "Reset Password"}
          {step === 2 && "Enter OTP"}
          {step === 3 && "Create New Password"}
        </h1>
        {step === 2 && (
          <p className="text-xs sm:text-sm text-zinc-500 mt-2">
            We've sent a 6-digit code to <br/><span className="font-semibold text-zinc-800 dark:text-zinc-200">{target}</span>
          </p>
        )}
      </div>

      {step === 1 && (
        <Form {...step1Form}>
          <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="w-full space-y-4">
            <FormField
              control={step1Form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-900 dark:text-zinc-200 font-bold text-xs sm:text-sm">
                    Email ID / Mobile Number
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        className="peer ps-10 h-10 sm:h-11 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-visible:ring-[#E51E44] dark:focus-visible:ring-rose-800 text-sm"
                        placeholder="Enter your registered email or mobile"
                        type="text"
                        {...field}
                      />
                      <div className="text-[#E51E44] dark:text-rose-500 absolute inset-y-0 start-0 flex items-center justify-center ps-3.5 peer-disabled:opacity-50">
                        <Mail size={18} aria-hidden="true" strokeWidth={2} />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-10 sm:h-11 mt-4 rounded-xl bg-[#E51E44] hover:bg-[#C21A3A] dark:bg-rose-700 dark:hover:bg-rose-800 text-white text-sm font-semibold" disabled={loading}>
              {loading ? <LoadingButton title="Sending OTP" /> : "Send OTP"}
            </Button>
          </form>
        </Form>
      )}

      {step === 2 && (
        <Form {...step2Form}>
          <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="w-full space-y-4">
            <FormField
              control={step2Form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-900 dark:text-zinc-200 font-bold text-xs sm:text-sm">
                    6-Digit OTP
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex gap-2">
                      <div className="relative flex-grow">
                        <Input
                          className="peer ps-10 h-10 sm:h-11 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-visible:ring-[#E51E44] dark:focus-visible:ring-rose-800 text-sm tracking-widest font-mono text-center"
                          placeholder="• • • • • •"
                          type="text"
                          maxLength={6}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                        />
                        <div className="text-[#E51E44] dark:text-rose-500 absolute inset-y-0 start-0 flex items-center justify-center ps-3.5 peer-disabled:opacity-50">
                          <KeyRound size={18} aria-hidden="true" strokeWidth={2} />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendOtp}
                        disabled={resendLoading || otpTimer > 0}
                        className="h-10 sm:h-11 rounded-xl px-4 text-xs font-bold border-zinc-200 dark:border-zinc-700 w-[100px]"
                      >
                        {resendLoading ? (
                          <LoadingButton title="..." />
                        ) : otpTimer > 0 ? (
                          `${otpTimer}s`
                        ) : (
                          "Resend"
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 mt-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3 h-10 sm:h-11 rounded-xl">
                Back
              </Button>
              <Button type="submit" className="w-2/3 h-10 sm:h-11 rounded-xl bg-[#E51E44] hover:bg-[#C21A3A] dark:bg-rose-700 dark:hover:bg-rose-800 text-white text-sm font-semibold">
                Verify & Next
              </Button>
            </div>
          </form>
        </Form>
      )}

      {step === 3 && (
        <Form {...step3Form}>
          <form onSubmit={step3Form.handleSubmit(onStep3Submit)} className="w-full space-y-4">
            <FormField
              control={step3Form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-zinc-900 dark:text-zinc-200 font-bold text-xs sm:text-sm">
                    New Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative w-full">
                      <PasswordInput
                        field={field}
                        ariaInvalid={fieldState.invalid}
                        placeholder="Enter new password"
                        isIcon={false}
                        className="peer ps-10 h-10 sm:h-11 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-visible:ring-[#E51E44] dark:focus-visible:ring-rose-800 w-full text-sm"
                      />
                      <div className="text-[#E51E44] dark:text-rose-500 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3.5 peer-disabled:opacity-50">
                        <KeyRound size={18} aria-hidden="true" strokeWidth={2} />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={step3Form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-zinc-900 dark:text-zinc-200 font-bold text-xs sm:text-sm">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative w-full">
                      <PasswordInput
                        field={field}
                        ariaInvalid={fieldState.invalid}
                        placeholder="Confirm your new password"
                        isIcon={false}
                        className="peer ps-10 h-10 sm:h-11 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-visible:ring-[#E51E44] dark:focus-visible:ring-rose-800 w-full text-sm"
                      />
                      <div className="text-[#E51E44] dark:text-rose-500 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3.5 peer-disabled:opacity-50">
                        <KeyRound size={18} aria-hidden="true" strokeWidth={2} />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 mt-4">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-1/3 h-10 sm:h-11 rounded-xl" disabled={loading}>
                Back
              </Button>
              <Button type="submit" className="w-2/3 h-10 sm:h-11 rounded-xl bg-[#E51E44] hover:bg-[#C21A3A] dark:bg-rose-700 dark:hover:bg-rose-800 text-white text-sm font-semibold" disabled={loading}>
                {loading ? <LoadingButton title="Resetting" /> : "Reset Password"}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Back to Login */}
      <div className="mt-5 sm:mt-6 flex items-center justify-center">
        <Button asChild variant="ghost" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300">
          <Link href="/auth/login" className="flex items-center gap-2 text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </Button>
      </div>
    </div>
  );
}
