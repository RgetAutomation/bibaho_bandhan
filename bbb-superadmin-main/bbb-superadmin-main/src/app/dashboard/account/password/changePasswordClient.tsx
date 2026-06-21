"use client";

import ButtonLoading from "@/components/buttonLoading";
import PasswordInput from "@/components/ui-custom/password-input";
import PasswordInputWithValidation from "@/components/ui-custom/password-input-with-validation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { KeyRound } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

export default function ChangePasswordClient() {
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

  async function onSubmit(value: z.infer<typeof changePasswordSchema>) {
    setLoading(true);
    const { data, error } = await authClient.changePassword({
      currentPassword: value.oldPassword,
      newPassword: value.newPassword,
      revokeOtherSessions: value.revokeOtherSessions,
    });

    if (data?.token && !error) {
      toast.success("Password changed successfully");
      form.reset();
    } else {
      toast.error(error?.message || "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <Card className="m-3 w-full max-w-sm rounded-2xl shadow-lg sm:m-4 md:m-5 lg:m-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Change Password</CardTitle>
        <CardDescription>
          Update your account password to keep your profile secure.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Current Password */}
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <PasswordInput
                        field={field}
                        isIcon={true}
                        placeholder="Enter your current password"
                      />
                      <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                        <KeyRound size={16} aria-hidden="true" />{" "}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInputWithValidation
                      field={field}
                      isIcon={true}
                      placeholder="Enter your new password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <PasswordInput
                        field={field}
                        isIcon={true}
                        placeholder="Re-enter your new password"
                      />
                      <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                        <KeyRound size={16} aria-hidden="true" />{" "}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="revokeOtherSessions"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Label className="hover:bg-accent/50 has-[[aria-checked=true]]:border-primary flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:bg-rose-50 dark:has-[[aria-checked=true]]:border-rose-900 dark:has-[[aria-checked=true]]:bg-rose-950">
                        <Checkbox
                          id="toggle-2"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white dark:data-[state=checked]:border-rose-700 dark:data-[state=checked]:bg-rose-700"
                        />
                        <div className="grid gap-1.5 font-normal">
                          <p className="text-sm leading-none font-medium">
                            Revoke other sessions
                          </p>
                          <p className="text-muted-foreground text-sm">
                            If you want to revoke other sessions, please check
                            this box to proceed.
                          </p>
                        </div>
                      </Label>
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            {/* Submit */}
            <div className="flex justify-end">
              <Button
                type="submit"
                className="w-full rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                disabled={loading}
              >
                {loading ? (
                  <ButtonLoading text="Please wait" />
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
