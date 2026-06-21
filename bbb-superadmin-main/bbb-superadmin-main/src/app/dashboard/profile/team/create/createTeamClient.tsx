"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Mars, RefreshCcw, Venus } from "lucide-react";
import React, { Suspense, useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTeamInput, createTeamSchema } from "@/schema/teamSchema";
import { generateStrongPassword } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import z from "zod";
import { createTeamUser } from "@/action/users";
import toast from "react-hot-toast";
import ButtonLoading from "@/components/buttonLoading";
import Loader from "@/components/loader";

export default function CreateTeamClient() {
  return (
    <Suspense fallback={<Loader />}>
      <CreateTeam />
    </Suspense>
  );
}

function CreateTeam() {
  const roleSchema = z.enum(["ADMIN", "MODERATOR", "GHOTOK"]);
  const params = useSearchParams();
  const roleParam = params.get("role")?.toUpperCase();
  const parsedRole = roleSchema.safeParse(roleParam);
  const role = parsedRole.success ? parsedRole.data : "ADMIN";

  const [loading, setLoading] = useState(false);

  // Form
  const form = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "MALE",
      phone: "",
      email: "",
      password: "",
      role, // validated role or fallback "ADMIN"
    },
  });

  // Generate password on first mount
  useEffect(() => {
    const pwd = generateStrongPassword();
    form.setValue("password", pwd);
  }, [form]);

  async function onSubmit(values: CreateTeamInput) {
    setLoading(true);
    try {
      const response = await createTeamUser(values);
      if (response?.success) {
        form.reset();
        toast.success(response.message || "User created successfully.");
      } else {
        toast.error(
          response?.message || "Failed to create user. Please try again."
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="bg-card flex w-full flex-row items-center gap-4 border p-4 md:p-6">
        <Button
          variant={"outline"}
          className="h-10 w-10 rounded-full"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
          Create Team Users
        </h1>
      </div>

      <div className="bg-card m-4 flex max-w-md flex-1 flex-col gap-4 rounded-2xl border p-4 shadow md:p-6 lg:p-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-xl space-y-6"
          >
            <div className="grid grid-cols-2 gap-2">
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      First Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Middle Name */}
              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter middle name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Last Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gender */}
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
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">
                        <Mars className="mr-2 h-4 w-4" />
                        Male
                      </SelectItem>
                      <SelectItem value="FEMALE">
                        <Venus className="mr-2 h-4 w-4" />
                        Female
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex rounded-md shadow-xs">
                      <span className="border-input inline-flex items-center rounded-s-md border px-3 text-sm">
                        +91
                      </span>
                      <Input
                        className="-ms-px rounded-s-none shadow-none"
                        placeholder="Enter phone number"
                        type="tel"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        {...field}
                      />
                    </div>
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
                    Email <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex w-full gap-2">
                      <Input
                        type="text"
                        placeholder="Enter password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant={"outline"}
                        size={"icon"}
                        onClick={() =>
                          form.setValue("password", generateStrongPassword(), {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Role <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="MODERATOR">MODERATOR</SelectItem>
                      <SelectItem value="GHOTOK">GHOTOK</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <ButtonLoading text="Creating Team" />
              ) : (
                <span>Create Team</span>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
