"use client";

import { updateRejectMessageTemplate } from "@/action/templates";
import ButtonLoading from "@/components/buttonLoading";
import {
  IRejectMessageTemplate,
  IRejectMessageTemplateUpdate,
} from "@/components/interface/IMessageTemplate";
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
import { Textarea } from "@/components/ui/textarea";
import { rejectTemplateSchema } from "@/schema/templateSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { TeamRole } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

export default function EditMessageTemplateClientComponent({
  id,
  name,
  content,
}: IRejectMessageTemplate) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof rejectTemplateSchema>>({
    resolver: zodResolver(rejectTemplateSchema),
    defaultValues: {
      name: name ?? "",
      content: content ?? "0",
    },
  });

  async function onSubmit(values: z.infer<typeof rejectTemplateSchema>) {
    setLoading(true);
    console.log(values);

    const planData: IRejectMessageTemplateUpdate = {
      id: id,
      name: values.name,
      content: values.content,
      roles: [TeamRole.MODERATOR] as TeamRole[],
    };
    const response = await updateRejectMessageTemplate(planData);
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
            <h1 className="text-2xl font-semibold">Edit Message Template</h1>
            <p className="text-muted-foreground text-sm">
              Update your message template
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Plan Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label>Template Name</Label>
                  <FormControl>
                    <Input placeholder="Enter Template Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plan Price */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <Label>Content</Label>
                  <FormControl>
                    <Textarea placeholder="Enter Message Content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <ButtonLoading text="Updating Template" />
              ) : (
                "Update Message Template"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
