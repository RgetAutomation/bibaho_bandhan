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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { CheckCircle2, CircleX, Mars, Venus } from "lucide-react";
import { useState } from "react";
import SubmitLoadingView from "@/components/submitLoadingView";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import axios, { AxiosError } from "axios";
import { AxiosResponse } from "@/components/interface/AxiosResponse";
import { MAIN_API_URL } from "@/lib/constant-data";

const FormSchema = z.object({
  firstName: z.string().min(3, {
    message: "First Name is required",
  }),
  middleName: z.string().optional(),
  lastName: z.string().min(3, {
    message: "Last Name is required",
  }),
  gender: z.string().min(4, {
    message: "Gender is required",
  }),
  phone: z.string().min(10, {
    message: "Mobile number should be at least 10 characters",
  }),
  email: z.email({
    message: "Invalid email",
  }),
  password: z
    .string()
    .min(1, {
      message: "Password is required",
    })
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Password must contain at least one letter, one number, and one special character"
    ),
});

interface DataRespose {
  success: boolean;
  message: string;
}

export default function MatchmakerClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [respose, setRespose] = useState<DataRespose>();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      phone: "",
      email: "",
      password: "",
    },
  });
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    const initRespose: DataRespose = {
      success: false,
      message: "",
    };
    setRespose(initRespose);
    try {
      const respone = await axios.post<AxiosResponse<string>>(
        `${MAIN_API_URL}/app/ghotok/join`,
        data
      );

      if (respone.data.success) {
        setRespose({ success: true, message: respone.data.message });
        router.replace(`/matchmaker/status/${respone.data.data}`);
      }
      if (respone.data.success === false) {
        setRespose({ success: false, message: respone.data.message });
      }
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        setRespose({ success: false, message: error?.response?.data?.message });
      }
    }
    setLoading(false);
  }
  return (
    <div className="flex flex-col pt-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    First Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your first name"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your middle name"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Last Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your last name"
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Gender <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MALE">
                      <Mars className="h-4 w-4" />
                      MALE
                    </SelectItem>
                    <SelectItem value="FEMALE">
                      <Venus className="h-4 w-4" />
                      FEMALE
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mobile Number */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Mobile Number <span className="text-red-500">*</span>
                </FormLabel>
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

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Password <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    type="password"
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
              <SubmitLoadingView text="Submitting..." />
            ) : (
              "Submit Application"
            )}
          </Button>
        </form>
      </Form>
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
        "flex items-center justify-center rounded-lg p-2 gap-1"
      )}
    >
      <span
        className={cn(
          respose.success
            ? "text-green-500 dark:text-white"
            : "text-red-500 dark:text-white",
          "flex items-center justify-center gap-1 text-sm text-center"
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
