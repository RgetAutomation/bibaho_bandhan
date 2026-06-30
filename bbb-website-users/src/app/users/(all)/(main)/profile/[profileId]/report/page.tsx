"use client";

import DashboardHeader from "@/components/dashboard/header";
import { AxiosResponse } from "@/components/interface/AxiosResponse";
import { LoadingButton } from "@/components/loadingButton";
import { compressImage } from "@/components/system/compressImage";
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
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import api from "@/lib/axiosInstance";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

const FormSchema = z.object({
  reason: z
    .string({
      error: "Reason is required",
    })
    .min(10, "Reason should be at least 10 characters"),
  attachment: z.instanceof(File).optional(),
});

export default function ReportPage() {
  const params = useParams<{ profileId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      reason: "",
      attachment: undefined,
    },
  });
  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("reportedId", params.profileId);
      formData.append("reason", data.reason);
      if (data.attachment) {
        const screenshot = await compressImage(data.attachment as File, 150);
        formData.append("file", screenshot);
      }

      const response = await api.post<AxiosResponse<null>>(
        "/users/profile/report",
        formData,
      );
      if (response.data.success) {
        toast.success(response.data.message || "Profile reported successfully");
        router.back();
      } else {
        toast.error(response.data?.message || "Incorrect email or password");
        setLoading(false);
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || "Failed to report profile"
        : "An unexpected error occurred";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] md:min-h-screen bg-white md:bg-[#FCFAF8] dark:bg-zinc-900 md:dark:bg-zinc-950 items-center justify-start md:justify-center p-0 md:p-8">
      <div className="w-full flex-1 md:flex-none max-w-lg bg-white dark:bg-zinc-900 border-0 md:border md:border-[#F0E8E8] md:dark:border-zinc-800 rounded-none md:rounded-3xl shadow-none md:shadow-sm overflow-hidden flex flex-col">
        {/* Header Area */}
        <div className="p-6 md:p-8 pb-4 md:pb-6 border-b border-[#F0E8E8] dark:border-zinc-800 bg-[#FCFAF8] dark:bg-zinc-950/50 text-center">
          <div className="w-14 h-14 bg-red-50 dark:bg-red-950/20 text-[#9B1C31] dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/30">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-zinc-100">Report Profile</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium mt-2">
            Please let us know why you are reporting this user. Our team will review the profile.
          </p>
        </div>

        {/* Form Area */}
        <div className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                      Reason for Reporting <span className="text-[#9B1C31]">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe the issue in detail..."
                        minLength={10}
                        {...field}
                        className="min-h-[120px] resize-none rounded-xl border-gray-200 dark:border-zinc-800 bg-[#FCFAF8] dark:bg-zinc-950 focus-visible:ring-[#9B1C31] focus-visible:ring-offset-0 text-sm font-medium"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-semibold text-[#9B1C31]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attachment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                      Attachment Evidence
                      <span className="text-gray-400 text-[11px] font-semibold italic">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          field.onChange(file);
                        }}
                        className="rounded-xl border-gray-200 dark:border-zinc-800 bg-[#FCFAF8] dark:bg-zinc-950 cursor-pointer file:text-[#9B1C31] file:bg-[#9B1C31]/10 file:font-bold file:rounded-md file:border-0 file:px-3 file:py-1 file:mr-3 hover:file:bg-[#9B1C31]/20 h-auto py-2 font-medium text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-semibold text-[#9B1C31]" />
                  </FormItem>
                )}
              />

              <div className="pt-2 flex flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 rounded-xl font-bold py-5 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 h-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-[#9B1C31] hover:bg-[#801426] text-white font-bold py-5 border-none shadow-sm shadow-[#9B1C31]/20 h-auto"
                >
                  {loading ? (
                    <LoadingButton title="Submitting..." />
                  ) : (
                    <span>Submit Report</span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
