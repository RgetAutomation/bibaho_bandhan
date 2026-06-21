"use client";

import ButtonLoading from "@/components/buttonLoading";
import RadioCustom from "@/components/ui-custom/radio-custom";
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
import api from "@/lib/axiosInstance";
import { createUserSchema } from "@/schema/ghotok/usersSchema";
import { AxiosResponse } from "@/types/AxiosResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { ArrowLeft, Mars, Venus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

const genderOptions = [
  {
    value: "MALE",
    label: "Male",
    icon: Mars,
    textColor: "text-blue-400",
  },
  {
    value: "FEMALE",
    label: "Female",
    icon: Venus,
    textColor: "text-pink-400",
  },
];

export default function CreateUserClient({ gender }: { gender: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: gender.toUpperCase() === "MALE" ? "MALE" : "FEMALE",
      phone: "",
    },
  });

  async function onSubmit(values: z.infer<typeof createUserSchema>) {
    setLoading(true);
    try {
      const respones = await api.post<AxiosResponse<null>>(
        "/app/ghotok/users/create",
        {
          firstName: values.firstName,
          middleName: values.middleName,
          lastName: values.lastName,
          gender: values.gender,
          phone: values.phone,
        }
      );
      if (respones.data.success) {
        form.reset();
        toast.success("User created successfully");
      } else {
        toast.error(respones.data.message);
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data.message
        : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className={"flex max-w-lg flex-1 flex-col p-3 md:p-5"}>
      <div className={"bg-card flex flex-col rounded-2xl border shadow-md"}>
        <div className={"mb-5 flex w-full gap-4 border-b p-5"}>
          <Button
            variant={"outline"}
            className={"m-1 size-10 rounded-full"}
            onClick={() => router.back()}
          >
            <ArrowLeft className={"size-5"} />
          </Button>
          <div className={"flex flex-col"}>
            <h1 className={"text-2xl font-bold"}>Create User</h1>
            <p className={"text-muted-foreground text-sm"}>
              Create a new user account
            </p>
          </div>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-4"
          >
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter first name"
                          type="text"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Middle Name"
                          type="text"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter last name"
                      type="text"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    Gender <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioCustom field={field} items={genderOptions} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Phone number</FormLabel>
                  <FormControl className="w-full">
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

            <Button type="submit" className={"mt-2 w-full"} disabled={loading}>
              {loading ? <ButtonLoading text="Creating User" /> : "Create User"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
