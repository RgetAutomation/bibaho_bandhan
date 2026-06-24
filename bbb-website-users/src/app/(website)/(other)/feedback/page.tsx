"use client";

import { AxiosResponse } from "@/components/interface/AxiosResponse";
import FeedbackRadioComponent from "@/components/ui-custom/feedback-radio";
import InputCustom from "@/components/ui-custom/input/input-custom";
import InputEmail from "@/components/ui-custom/input/input-email";
import InputPhone from "@/components/ui-custom/input/input-phone";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axiosInstance";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

const feedbackSchema = z.object({
  rating: z.string().min(1, "Rating is required"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone is required"),
  email: z.string().optional(),
  message: z.string().min(10, "Message should be at least 10 characters"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export default function FeedbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: "5",
      name: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    setLoading(true);
    try {
      const response = await api.post<AxiosResponse<null>>(
        "/other/feedback",
        data,
      );
      console.log(response);
      if (response.data.success) {
        form.reset();
        router.push("/feedback/thanks");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
    setLoading(false);
  };
  return (
    <div className="flex items-center justify-center px-2 py-12 md:px-4 md:py-14 lg:px-6 lg:py-16 bg-gray-50 dark:bg-background">
      <div className="max-w-xl mx-auto bg-transparent md:bg-white dark:md:bg-muted p-0 md:p-4 lg:p-6 rounded-none md:rounded-2xl shadow-none md:shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          We value your feedback
        </h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-0 md:p-5 space-y-6"
          >
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FeedbackRadioComponent field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="pb-1">
                    Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputCustom
                      placeholder="Enter your name"
                      field={field}
                      ariaInvalid={fieldState.invalid}
                      type="text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="pb-1">
                    Moblie Number <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputPhone
                      placeholder="Enter your mobile number"
                      field={field}
                      areaInvalid={fieldState.invalid}
                      type="text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="pb-1">Email</FormLabel>
                  <FormControl>
                    <InputEmail
                      placeholder="Enter your email address"
                      field={field}
                      areaInvalid={fieldState.invalid}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="pb-1">
                    Your feedback <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your feedback here..."
                      className="resize-y h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting</span>
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
