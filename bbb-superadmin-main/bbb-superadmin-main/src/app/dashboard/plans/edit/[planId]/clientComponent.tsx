"use client";

import { updatePlan } from "@/action/plan";
import { IPlan } from "@/components/interface/IPlan";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { plansSchema } from "@/schema/planSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

export default function EditPlanClientComponent({
  id,
  title,
  price,
  duration,
}: IPlan) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof plansSchema>>({
    resolver: zodResolver(plansSchema),
    defaultValues: {
      title: title ?? "",
      price: price ?? "",
      duration: duration ?? "",
      //connections: connection ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof plansSchema>) {
    setLoading(true);
    const planData: IPlan = {
      id: id,
      title: values.title,
      price: values.price.toString(),
      duration: values.duration,
      connection: "0",
      status: false,
    };
    const response = await updatePlan(planData);
    if (response.success) {
      toast.success(response.message);
      router.back();
    } else {
      toast.error(response.message);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-1 flex-col p-5">
      <div className="bg-card w-full max-w-md rounded-md border p-6 shadow-2xl">
        {/* Heading */}
        <div className="mb-6 flex items-start gap-3">
          <Button
            variant={"outline"}
            size={"icon"}
            className="rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Edit Existing Plan</h1>
            <p className="text-muted-foreground text-sm">
              Changes will reflect to this subscription plan for users
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Plan Name */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <Label>Plan Name</Label>
                  <FormControl>
                    <Input placeholder="Gold / Diamond / Platinum" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plan Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <Label>Plan Price (₹)</Label>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1500"
                      {...field}
                      //onChange={(e) => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plan Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <Label>Plan Duration (In Days)</Label>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter plan duration"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Connections */}
            {/* <FormField
              control={form.control}
              name="connections"
              render={({ field }) => (
                <FormItem>
                  <Label>Allowed Connections</Label>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10 / 20 / 50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating Plan...</span>
                </>
              ) : (
                "Update Plan"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
