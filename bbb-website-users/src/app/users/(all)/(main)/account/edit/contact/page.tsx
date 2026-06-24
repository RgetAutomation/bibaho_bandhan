"use client";

import DashboardHeader from "@/components/dashboard/header";
import { UserType } from "@/components/enum/userType";
import { redirect, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import InputEmail from "@/components/ui-custom/input/input-email";
import { useState } from "react";
import { LoadingButton } from "@/components/loadingButton";
import { RefreshCcw } from "lucide-react";
import { AxiosResponse } from "@/components/interface/AxiosResponse";
import api from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { isAxiosError } from "axios";
import LoadingPage from "@/components/loader";

const contactDetailsSchema = z.object({
  phone: z.string().min(10, "Mobile number must be at least 10 digits"),
  email: z
    .string()
    .optional()
    .refine((e) => !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), {
      message: "Invalid email address",
    }),
});

export default function ProfileEditPage() {
  const { user, isPending } = useAuthSession();
  const userType = user?.type as UserType;
  const userPhone = user?.phone;
  const userEmail = user?.email;

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isDummyEmail = userEmail?.endsWith("@example.com");

  const form = useForm<z.infer<typeof contactDetailsSchema>>({
    resolver: zodResolver(contactDetailsSchema),
    defaultValues: {
      phone: userPhone || "",
      email: isDummyEmail ? "" : userEmail || "",
    },
  });

  if (isPending) {
    return (
      <div className="flex flex-1">
        <LoadingPage />
      </div>
    );
  }

  // allowed for free users as well

  async function onSubmit(data: z.infer<typeof contactDetailsSchema>) {
    setLoading(true);
    try {
      ///users/profile/update/contact
      const response = await api.post<AxiosResponse<null>>(
        "/users/profile/update/contact",
        {
          phone: data.phone,
          email: data.email ? data.email : userEmail,
        },
      );
      if (response.data.success) {
        form.reset();
        toast.success(response.data.message || "Contact details updated");
        router.push("/users/account");
      } else {
        toast.error(
          response.data.message || "Failed to update contact details",
        );
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || "Failed to update contact details"
        : "Something went wrong";
      if (errorMessage === "Contact details are already up to date") {
        toast.success(errorMessage);
      } else toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex flex-col h-[calc(100vh-80px)]">


      <div className="w-full flex flex-col flex-1 p-4 md:p-6 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-lg mx-auto md:shadow-lg md:border rounded-2xl md:p-6">
          {/* Header */}
          <div className="w-full flex flex-col gap-2 mb-5">
            <h1 className="text-2xl font-semibold ">Contact Details</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Provide your updated contact information so we can keep your
              profile current.
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              {/* Phone Field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium ">
                      Mobile <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex rounded-md shadow-xs">
                        {" "}
                        <span className="border-input bg-background text-muted-foreground inline-flex items-center rounded-s-md border px-3 text-sm">
                          {" "}
                          +91{" "}
                        </span>{" "}
                        <Input
                          type="tel"
                          inputMode="tel"
                          className="-ms-px rounded-s-none shadow-none"
                          maxLength={10}
                          minLength={10}
                          placeholder="Enter your mobile number"
                          {...field}
                        />{" "}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Email</FormLabel>
                    <FormControl>
                      <InputEmail
                        placeholder="Enter your email"
                        field={field}
                        areaInvalid={fieldState.invalid}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading ? (
                  <LoadingButton title="Updating..." />
                ) : (
                  <>
                    <RefreshCcw />
                    <span>Update Contact Details</span>
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
