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
import { KeyRound, Mail, ArrowRight, Heart, Users, UserRound } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/ui-custom/input/password-input";
import { LoadingButton } from "@/components/loadingButton";
import { AUTHENTICATION_REGISTER } from "@/components/helper/constant";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { detectIdentifierType } from "@/lib/utils";

const FormSchema = z.object({
  email: z.string().min(3, {
    message: "Email or Mobile is required",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
  remember: z.boolean().optional(),
});

export default function LoginClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setLoading(true);
    try {
      const inputType = detectIdentifierType(data.email);

      if (inputType === "INVALID") {
        toast.error("Invalid email or username");
        setLoading(false);
        return;
      }

      let response;
      if (inputType === "EMAIL") {
        response = await authClient.signIn.email({
          email: data.email,
          password: data.password,
          rememberMe: data.remember,
        });
      } else {
        response = await authClient.signIn.username({
          username: data.email,
          password: data.password,
          rememberMe: data.remember,
        });
      }

      if (response.data && !response.error) {
        toast.success("Login successful!");
        router.push("/users/home");
      } else {
        toast.error(response.error?.message || "Incorrect email or password");
        setLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/users/home",
      });
    } catch (error) {
      toast.error("Google sign-in failed");
    }
  };

  return (
    <div className="flex flex-col p-5 sm:p-6 lg:p-8 w-full md:min-w-[420px] lg:min-w-[460px] max-w-[480px] mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col items-center justify-center text-center mb-6 mt-1">
        <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950 flex items-center justify-center mb-3 border border-rose-100 dark:border-rose-900">
          <UserRound className="w-6 h-6 text-[#E51E44] dark:text-rose-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#E51E44]">Welcome Back!</h1>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-900 dark:text-zinc-200 font-bold text-xs sm:text-sm">
                  Email ID / Mobile Number
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      className="peer ps-10 h-10 sm:h-11 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-visible:ring-[#E51E44] dark:focus-visible:ring-rose-800 text-sm"
                      placeholder="Enter your email ID or mobile number"
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

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-zinc-900 dark:text-zinc-200 font-bold text-xs sm:text-sm">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <PasswordInput
                      field={field}
                      ariaInvalid={fieldState.invalid}
                      placeholder="Enter your password"
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

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="remember" className="w-3.5 h-3.5 rounded border-zinc-300 text-[#E51E44] focus:ring-[#E51E44] accent-[#E51E44]" {...form.register("remember")} />
              <label htmlFor="remember" className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">Remember me</label>
            </div>
            <Link href="/auth/forgot-password" className="text-xs sm:text-sm font-bold text-[#E51E44] dark:text-rose-500 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" className="w-full h-10 sm:h-11 mt-4 rounded-xl bg-[#E51E44] hover:bg-[#C21A3A] dark:bg-rose-700 dark:hover:bg-rose-800 text-white text-sm font-semibold" disabled={loading}>
            {loading ? (
              <LoadingButton title="Please wait" />
            ) : (
              <div className="flex items-center justify-center gap-2 w-full">
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>
        </form>
      </Form>

      {/* Or continue with */}
      <div className="relative flex items-center py-4">
        <div className="flex-grow border-t border-zinc-200 dark:border-zinc-700"></div>
        <span className="flex-shrink-0 mx-4 text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs font-semibold">or continue with</span>
        <div className="flex-grow border-t border-zinc-200 dark:border-zinc-700"></div>
      </div>

      <Button onClick={handleGoogleSignIn} type="button" variant="outline" className="w-full h-10 sm:h-11 rounded-xl border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-semibold bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </Button>

      <div className="mt-5 sm:mt-6 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/50 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="bg-amber-100/50 dark:bg-amber-800/30 p-2 sm:p-2.5 rounded-full text-amber-600 dark:text-amber-500 flex-shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div className="flex-grow text-center sm:text-left">
          <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">New to Bangali Bibaho Bandhan?</h3>
          <p className="text-[10px] text-zinc-600 dark:text-zinc-400 mt-0.5">Create an account and start your journey today.</p>
        </div>
        <Button asChild variant="outline" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30 bg-transparent rounded-xl text-[11px] sm:text-xs font-bold px-4 py-1 h-auto flex-shrink-0 mt-2 sm:mt-0">
          <Link href="/">Create Account</Link>
        </Button>
      </div>
    </div>
  );
}
