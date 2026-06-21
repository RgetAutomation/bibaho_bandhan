"use client";

import ButtonLoading from "@/components/buttonLoading";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z, { set } from "zod";

const changeMobileSchema = z.object({
  mobile: z.string().min(10).max(10),
});

const changeEmailSchema = z.object({
  email: z.email(),
});

export default function ProfileClientPage({
  mobile,
  email,
}: {
  mobile: string;
  email: string;
}) {
  const router = useRouter();
  const [changingMobile, setChangingMobile] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);

  const mobileForm = useForm({
    resolver: zodResolver(changeMobileSchema),
    defaultValues: {
      mobile: mobile,
    },
  });

  const emailForm = useForm({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: email,
    },
  });

  const handleMobileChange = async (
    value: z.infer<typeof changeMobileSchema>
  ) => {
    setChangingMobile(true);
    const { data: response } = await authClient.isUsernameAvailable({
      username: value.mobile,
    });
    if (response?.available) {
      const { data, error } = await authClient.updateUser({
        username: value.mobile,
      });
      if (data?.status && !error) {
        toast.success("Mobile number changed successfully");
        router.refresh();
      } else {
        toast.error(error?.message || "Failed to change mobile number");
      }
    } else {
      toast.error("Mobile number is already in use");
    }
    setChangingMobile(false);
  };

  const handleEmailChange = async (
    value: z.infer<typeof changeEmailSchema>
  ) => {
    setChangingEmail(true);
    const { data, error } = await authClient.changeEmail({
      newEmail: value.email,
    });

    if (data?.status && !error) {
      toast.success("Email changed successfully");
      router.refresh();
    } else {
      toast.error(error?.message || "Failed to change email");
    }
    setChangingEmail(false);
  };

  return (
    <div className="bg-card flex w-full max-w-sm flex-col rounded-2xl border p-4 shadow-md md:p-5">
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-semibold text-lg">Change Mobile</h1>
          <p className="text-muted-foreground text-sm">
            Change your mobile number
          </p>
        </div>

        <Form {...mobileForm}>
          <form
            onSubmit={mobileForm.handleSubmit(handleMobileChange)}
            className="flex flex-col space-y-5"
          >
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

            {/* Submit Button */}
            <div className={"flex items-center justify-end"}>
              <Button
                className="rounded-full font-semibold"
                type="submit"
                disabled={changingMobile}
              >
                {changingMobile ? (
                  <ButtonLoading text="Please wait" />
                ) : (
                  "Change Mobile"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-semibold text-lg">Change Email</h1>
          <p className="text-muted-foreground text-sm">
            Change your email address
          </p>
        </div>

        <Form {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(handleEmailChange)}
            className="flex flex-col space-y-5"
          >
     
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    Email <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email address"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          
            <div className={"flex items-center justify-end"}>
              <Button
                className="rounded-full font-semibold"
                type="submit"
                disabled={changingEmail}
              >
                {changingEmail ? (
                  <ButtonLoading text="Please wait" />
                ) : (
                  "Change Email"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div> */}
    </div>
  );
}
