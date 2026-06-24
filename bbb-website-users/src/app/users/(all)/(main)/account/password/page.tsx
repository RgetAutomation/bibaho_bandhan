"use client";

import DashboardHeader from "@/components/dashboard/header";
import InputPassword from "@/components/ui-custom/input/password-input";
import PasswordInputWithValidation from "@/components/ui-custom/input/password-input-with-validation";
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
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { changePasswordSchema } from "@/schema/changePasswordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

export default function ChangePassword() {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      revokeOtherSessions: false,
    },
  });

  async function onSubmit(values: z.infer<typeof changePasswordSchema>) {
    setLoading(true);
    try {
      const { data, error } = await authClient.changePassword({
        newPassword: values.newPassword,
        currentPassword: values.oldPassword,
        revokeOtherSessions: values.revokeOtherSessions,
      });
      if (error || !data) {
        toast.error(error?.message || "Failed to change password");
      } else {
        form.reset();
        toast.success("Password changed successfully");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Something went wrong";
        toast.error(errorMessage); // or setError(errorMessage) etc.
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
    setLoading(false);
  }
  return (
    <div className="flex flex-col h-[calc(100vh-1px)] bg-[#FCFAF8] dark:bg-zinc-950">

      <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-[#F0E8E8] dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden flex flex-col mt-4 md:mt-8">
          {/* Header Area */}
          <div className="p-6 md:p-8 pb-4 md:pb-6 border-b border-[#F0E8E8] dark:border-zinc-800 bg-[#FCFAF8] dark:bg-zinc-950/50 text-center">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-zinc-100">Change Password</h1>
          </div>

          {/* Form Area */}
          <div className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Current Password */}
                <FormField
                  control={form.control}
                  name="oldPassword"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                        Current Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <InputPassword
                            field={field}
                            ariaInvalid={fieldState.invalid}
                            placeholder="Enter your current password"
                            isIcon
                          />
                          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                            <KeyRound size={16} aria-hidden="true" />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs font-semibold text-[#9B1C31]" />
                    </FormItem>
                  )}
                />

                {/* New Password */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <PasswordInputWithValidation
                          field={field}
                          ariaInvalid={fieldState.invalid}
                          placeholder="Enter your new password"
                          isIcon
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-semibold text-[#9B1C31]" />
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <InputPassword
                            field={field}
                            ariaInvalid={fieldState.invalid}
                            placeholder="Re-enter your new password"
                            isIcon
                          />
                          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                            <KeyRound size={16} aria-hidden="true" />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs font-semibold text-[#9B1C31]" />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <FormField
                    control={form.control}
                    name="revokeOtherSessions"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-center gap-2">
                          <FormControl>
                            <Label className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 has-[[aria-checked=true]]:border-[#9B1C31] flex items-start gap-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 transition-colors cursor-pointer has-[[aria-checked=true]]:bg-rose-50/50 dark:has-[[aria-checked=true]]:bg-[#9B1C31]/10">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-0.5 data-[state=checked]:border-[#9B1C31] data-[state=checked]:bg-[#9B1C31] data-[state=checked]:text-white h-5 w-5 rounded-md"
                              />
                              <div className="grid gap-1 font-normal">
                                <p className="text-sm leading-none font-bold text-gray-900 dark:text-zinc-100">
                                  Revoke other sessions
                                </p>
                                <p className="text-muted-foreground text-xs font-medium leading-relaxed">
                                  Log out everywhere else. This is recommended if you suspect your account has been compromised.
                                </p>
                              </div>
                            </Label>
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full rounded-xl bg-[#9B1C31] hover:bg-[#801426] text-white font-bold h-11 border-none shadow-sm shadow-[#9B1C31]/20 text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-5 w-5 mr-2" />
                        <span>Update Password</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
