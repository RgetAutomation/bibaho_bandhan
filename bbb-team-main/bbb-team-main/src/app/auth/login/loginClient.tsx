"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn, detectIdentifierType } from "@/lib/utils";
import { loginSchema } from "@/schema/loginSchema";
import { CircleCheck, CircleX, KeyRound, Phone } from "lucide-react";
import Image from "next/image";
import PasswordInput from "@/components/ui-custom/password-input";
import ButtonLoading from "@/components/buttonLoading";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";

const pageLinks = {
  reset: "/auth/reset",
  contact: "https://wa.me/919735661155?text=I%20need%20help",
};

interface DataRespose {
  success: boolean;
  message: string;
}

export default function LoginClient() {
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [respose, setRespose] = useState<DataRespose>();
  const router = useRouter();
  const [isDark, setIsDark] = useState(resolvedTheme === "dark");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(resolvedTheme === "dark");
  }, [resolvedTheme]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Ensure this runs only after client mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render nothing on server, avoids mismatch
    return null;
  }

  const onSubmit = async (formData: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      const inputType = detectIdentifierType(formData.email);

      if (inputType === "INVALID") {
        setRespose({
          success: false,
          message: "Invalid email or username",
        });
        setLoading(false);
        return;
      }

      let response;
      if (inputType === "EMAIL") {
        response = await authClient.signIn.email({
          email: formData.email,
          password: formData.password,
        });
      } else {
        response = await authClient.signIn.username({
          username: formData.email,
          password: formData.password,
        });
      }

      if (response.data?.token && !response.error) {
        setRespose({ success: true, message: "Login successfully" });
        router.push("/dashboard");
      } else {
        setRespose({
          success: false,
          message: response.error?.message || "Login failed",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="mx-auto flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-8 md:h-screen lg:py-0 dark:bg-zinc-950">
        <Card className="w-full max-w-md space-y-4 rounded-2xl p-6 shadow-lg">
          <CardHeader className="flex flex-col items-center space-y-3 text-center">
            <Link href="https://bibahobandhan.com">
              <Image
                src={isDark ? "/logo_light.svg" : "/logo_dark.svg"}
                alt="Bangali Bibaho Bandhan Logo"
                width={500}
                height={500}
                className="ring-primary ring-offset-card mb-2 h-14 w-14 rounded-full ring-2 ring-offset-2"
              />
            </Link>
            <CardTitle className="mb-0 text-2xl font-bold">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground pt-0 text-base">
              Securely sign in to continue.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0 sm:px-2 md:px-4 lg:px-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mobile or Email{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Enter mobile or email"
                            className="peer ps-9"
                            {...field}
                          />
                          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                            <Phone size={16} aria-hidden="true" />
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Password <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <PasswordInput
                            placeholder="Enter your password"
                            field={field}
                            isIcon={true}
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
                  className="w-full rounded-xl bg-rose-600 font-medium text-white hover:bg-rose-700"
                  size="lg"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <ButtonLoading text="Signing in" /> : "Sign In"}
                </Button>

                <ResposeView respose={respose} />
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col items-center gap-3">
            <div className="text-muted-foreground text-sm">
              Need help signing in?{" "}
              <Link
                target="_blank"
                href={pageLinks.contact}
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Contact Us
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}

function ResposeView({ respose }: { respose: DataRespose | undefined }) {
  if (!respose?.message) return null;
  return (
    <div
      className={cn(
        respose?.success
          ? "bg-green-100 dark:bg-green-500/10"
          : "bg-red-100 dark:bg-red-500/10",
        "flex items-center justify-center gap-1 rounded-lg p-2"
      )}
    >
      {respose.success ? (
        <CircleCheck className="mr-1 size-5 text-green-600" />
      ) : (
        <CircleX className="mr-1 size-5 text-red-600" />
      )}
      <span className={cn(respose.success ? "text-green-600" : "text-red-600")}>
        {respose?.message}
      </span>
    </div>
  );
}
