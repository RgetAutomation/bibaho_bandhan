"use client";

import { updateMessageTemplate } from "@/action/templates";
import ButtonLoading from "@/components/buttonLoading";
import {
  IMessageTemplate,
  IMessageTemplateUpdate,
} from "@/components/interface/IMessageTemplate";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { chatTemplateSchema } from "@/schema/templateSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { TeamRole } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

const items = [
  {
    id: "ADMIN",
    label: "ADMIN",
  },
  {
    id: "MODERATOR",
    label: "MODERATOR",
  },
] as const;

export default function EditMessageTemplateClientComponent({
  id,
  name,
  content,
  roles,
}: IMessageTemplate) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof chatTemplateSchema>>({
    resolver: zodResolver(chatTemplateSchema),
    defaultValues: {
      name: name ?? "",
      content: content ?? "0",
      roles: roles ?? [],
    },
  });

  async function onSubmit(values: z.infer<typeof chatTemplateSchema>) {
    setLoading(true);
    console.log(values);

    const planData: IMessageTemplateUpdate = {
      id: id,
      name: values.name,
      content: values.content,
      roles: values.roles as TeamRole[],
    };
    const response = await updateMessageTemplate(planData);
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

            {/* Connections */}
            <div className="flex items-center gap-4">
              {items.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="roles"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-center gap-2"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>

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
