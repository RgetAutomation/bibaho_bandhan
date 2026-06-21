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
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axiosInstance";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";
import { Flag, Loader2 } from "lucide-react";
import { AxiosResponse } from "@/types/AxiosResponse";

const FormSchema = z.object({
  reason: z
    .string({
      error: "Reason is required",
    })
    .min(10, "Reason should be at least 10 characters"),
  //attachment: z.instanceof(File).optional(),
});

export default function ReportUserClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      reason: "",
    },
  });
  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setLoading(true);
    try {
      const response = await api.post<AxiosResponse<null>>(
        "/app/ghotok/user/report",
        {
          userId: userId,
          reason: data.reason,
        }
      );
      if (response.data.success) {
        toast.success(response.data.message || "User reported successfully");
        router.push(`/dashboard/ghotok/report/${response.data.data}`);
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
    <div className="flex min-h-screen w-full flex-1 flex-col md:min-h-min">
      <h1 className="border-b px-5 py-5 text-lg font-bold md:text-xl lg:text-2xl">
        Report User
      </h1>

      <div className="max-w-md">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4 p-4"
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="pb-1">
                    Reason <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={"What is the reason for reporting?"}
                      minLength={10}
                      {...field}
                      className="h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className={"mt-2 w-full"} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Please wait</span>
                </>
              ) : (
                <>
                  <Flag className="h-4 w-4" />
                  <span>Report User</span>
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
