"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LoadingButton } from "@/components/loadingButton";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/components/interface/AxiosResponse";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ✅ Zod Schema
const formSchema = z.object({
  name: z.string().min(3, "Full name is required"),
  phone: z.string().min(10, "Enter valid contact number").max(15, "Too long"),
  email: z
    .string()
    .optional()
    .refine((val) => {
      if (val) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(val);
      }
      return true;
    }),
  reason: z.string().min(1, "Please select a reason"),
  message: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

export default function ChatPage() {
  const router = useRouter();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      reason: "",
      message: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const onSubmit = async (values: FormSchema) => {
    setLoading(true);
    setUserExists(false);
    setActiveRequestId(null);
    try {
      const response = await api.post<AxiosResponse<null>>(
        "/other/help/request",
        values,
      );

      if (response.data.success) {
        form.reset();
        router.push(`/helpcenter/status/${response.data.data}`);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      const errorMessage = isAxiosError(err)
        ? err.response?.data?.message || "Something went wrong"
        : "Something went wrong";
      
      if (errorMessage === "USER_ALREADY_EXISTS") {
        setUserExists(true);
      } else if (errorMessage === "ACTIVE_REQUEST_EXISTS") {
        const id = isAxiosError(err) ? err.response?.data?.data : null;
        setActiveRequestId(id);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={"w-full flex flex-col flex-1 items-center justify-center p-5"}
    >
      <div className="w-full max-w-lg mx-auto space-y-6 p-6 border rounded-2xl shadow-sm bg-card">
        <div className="flex flex-col items-center justify-center space-y-1 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Need Help?</h2>
          <p className="text-sm text-muted-foreground w-4/5">
            Tell us what you&apos;re having trouble with — our team will get
            back to you within 24 hours.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className={"text-destructive"}>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Number */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Contact Number <span className={"text-destructive"}>*</span>
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        inputMode="numeric"
                        type="tel"
                        pattern="[0-9]*"
                        maxLength={10}
                        autoComplete="tel"
                        placeholder="98765XXXXX"
                        className="!pl-3"
                        {...field}
                      />
                      <InputGroupAddon>
                        <InputGroupText>+91</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email Address{" "}
                    <span className={"text-muted-foreground"}>(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="example@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason Dropdown */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reason for Contact{" "}
                    <span className={"text-destructive"}>*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TECHNICAL">Technical Issue</SelectItem>
                      <SelectItem value="BILLING">Billing / Payment</SelectItem>
                      <SelectItem value="ACCOUNT">Account Related</SelectItem>
                      <SelectItem value="FEEDBACK">
                        Feedback / Suggestion
                      </SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Describe your issue{" "}
                    <span className={"text-muted-foreground"}>(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your issue or request in detail..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <LoadingButton title={"Submitting..."} />
              ) : (
                "Submit Request"
              )}
            </Button>

            {userExists && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={() => setUserExists(false)}
              >
                <div
                  className="flex flex-col items-center gap-4 p-6 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-yellow-200 dark:border-yellow-800 shadow-2xl w-full max-w-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-4xl">⚠️</span>
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-lg text-yellow-900 dark:text-yellow-100">Already Registered</p>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      This email or phone number is already registered. Please log in to submit a request from your dashboard.
                    </p>
                  </div>
                  <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                    <Link href="/users/helpcenter">Go to User Dashboard</Link>
                  </Button>
                  <button
                    onClick={() => setUserExists(false)}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
            {activeRequestId && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={() => setActiveRequestId(null)}
              >
                <div
                  className="flex flex-col items-center gap-4 p-6 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-2xl w-full max-w-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-4xl">⏳</span>
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-lg text-amber-900 dark:text-amber-100">Active Request Found</p>
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      You already have a help request that is still being processed. Please wait for it to be resolved before submitting a new one.
                    </p>
                  </div>
                  <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                    <Link href={`/helpcenter/status/${activeRequestId}`}>Track Your Request →</Link>
                  </Button>
                  <button
                    onClick={() => setActiveRequestId(null)}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>


      {/* Right Side */}
      <div className="flex flex-1 items-center justify-center gap-2 mt-5">
        <span>You already submitted a request?</span>
        <Button asChild variant={"outline"} className="rounded-full">
          <Link href="/helpcenter/search">View Status</Link>
        </Button>
      </div>
    </div>
  );
}
