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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { CheckCircle2, CircleX, Search } from "lucide-react";
import { useState } from "react";
import SubmitLoadingView from "@/components/submitLoadingView";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import axios, { AxiosError } from "axios";
import { AxiosResponse } from "@/components/interface/AxiosResponse";
import { MAIN_API_URL } from "@/lib/constant-data";
import api from "@/lib/axiosInstance";

const searchHelpCenterRequestSchema = z.object({
  email: z
    .string()
    .optional()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Please enter a valid email address",
    }),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10}$/.test(val),
      { message: "Phone number must be exactly 10 digits" },
    ),
});

interface DataRespose {
  success: boolean;
  message: string;
}

export default function SearchHelpCenterStatus() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [respose, setRespose] = useState<DataRespose>();

  const form = useForm<z.infer<typeof searchHelpCenterRequestSchema>>({
    resolver: zodResolver(searchHelpCenterRequestSchema),
    defaultValues: {
      email: "",
      phone: "",
    },
  });
  async function onSubmit(data: z.infer<typeof searchHelpCenterRequestSchema>) {
    if (!data.email && !data.phone) {
      setRespose({
        success: false,
        message: "Please enter your email address or mobile number",
      });
      return;
    }
    setLoading(true);
    const initRespose: DataRespose = {
      success: false,
      message: "",
    };
    setRespose(initRespose);
    try {
      const respone = await api.post<AxiosResponse<string>>(
        `${MAIN_API_URL}/other/help/request/search`,
        data,
      );

      if (respone.data.success) {
        router.push(`/helpcenter/status/${respone.data.data}`);
      }
      if (respone.data.success === false) {
        setRespose({ success: false, message: respone.data.message });
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        setRespose({
          success: false,
          message: error?.response?.data?.message,
        });
      }
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-10">
      <div className="md:max-w-md flex flex-col border border-border shadow-md rounded-2xl p-8 w-full max-w-lg bg-card gap-4">
        {/* Title */}
        <h1 className="text-2xl font-semibold tracking-tight text-center">
          Search Help Request
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          Enter your email address or mobile number to find your help request
        </p>

        {/* Form */}
        <div className="flex flex-col pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email address"
                        autoComplete="email"
                        type="email"
                        inputMode="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="w-full bg-border flex items-center justify-center border shadow rounded-2xl">
                <span>Or</span>
              </div>

              {/* Mobile Number */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+91-98765-XXXXX"
                        inputMode="numeric"
                        type="tel"
                        pattern="[0-9]*"
                        maxLength={10}
                        autoComplete="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ResposeView respose={respose} />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full text-base font-medium tracking-wide"
                disabled={loading}
              >
                {loading ? (
                  <SubmitLoadingView text="Searching..." />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search</span>
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


function ResposeView({ respose }: { respose: DataRespose | undefined }) {
  if (!respose?.message) return null;
  return (
    <div
      className={cn(
        respose?.success
          ? "bg-green-100 dark:bg-green-400"
          : "bg-red-200 dark:bg-red-400",
        "flex items-center justify-center rounded-lg p-2 gap-1",
      )}
    >
      <span
        className={cn(
          respose.success
            ? "text-green-500 dark:text-white"
            : "text-red-500 dark:text-white",
          "flex items-center justify-center gap-1 text-sm text-center",
        )}
      >
        {respose.success ? (
          <CheckCircle2 className="text-green-500 dark:text-white w-6 h-6 p-1" />
        ) : (
          <CircleX className="text-red-500 dark:text-white w-6 h-6 p-1" />
        )}
        {respose?.message}
      </span>
    </div>
  );
}
