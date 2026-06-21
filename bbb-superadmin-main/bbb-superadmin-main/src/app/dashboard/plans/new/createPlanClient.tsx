"use client";

import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { plansSchema } from "@/schema/planSchema";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { savePlan } from "@/action/plan";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { IPlan } from "@/components/interface/IPlan";

export default function CreatePlanClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof plansSchema>>({
    resolver: zodResolver(plansSchema),
    defaultValues: {
      title: "",
      price: "",
      duration: "",
      //connections: "",
    },
  });

  async function onSubmit(values: z.infer<typeof plansSchema>) {
    setLoading(true);

    const price = Number(values.price);

    // ✅ Correct price validation
    if (Number.isNaN(price) || price < 0) {
      toast.error("Please enter a valid price");
      setLoading(false);
      return;
    }

    const plan: IPlan = {
      title: values.title,
      price: price.toString(), // use validated number
      duration: values.duration,
      connection: "0",
      status: false,
    };

    try {
      const response = await savePlan(plan);

      if (response.success) {
        toast.success(response.message);
        form.reset();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
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
          <h1 className="text-2xl font-semibold">Create New Plan</h1>
          <p className="text-muted-foreground text-sm">
            Add a subscription plan for users
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
                  <Input type="number" placeholder="10 / 20 / 50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Plan...</span>
              </>
            ) : (
              "Create Plan"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
