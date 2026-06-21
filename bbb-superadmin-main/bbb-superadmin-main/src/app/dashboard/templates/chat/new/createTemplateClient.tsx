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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { chatTemplateSchema } from "@/schema/templateSchema";
import { createMessageTemplate } from "@/action/templates";
import { IMessageTemplateCreate } from "@/components/interface/IMessageTemplate";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TeamRole } from "@prisma/client";
import ButtonLoading from "@/components/buttonLoading";

export default function CreateTemplateClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof chatTemplateSchema>>({
    resolver: zodResolver(chatTemplateSchema),
    defaultValues: {
      name: "",
      content: "",
      roles: [],
    },
  });

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

  async function onSubmit(values: z.infer<typeof chatTemplateSchema>) {
    setLoading(true);

    const template: IMessageTemplateCreate = {
      name: values.name,
      content: values.content,
      roles: values.roles as TeamRole[],
    };

    const response = await createMessageTemplate(template);

    if (response.success) {
      toast.success(response.message);
      form.reset();
    } else {
      toast.error(response.message);
    }
    setLoading(false);
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
          <h1 className="text-2xl font-semibold">Create New Template</h1>
          <p className="text-muted-foreground text-sm">
            Add a new template to get started
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

          {/* Plan Duration */}
          {/* <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <Label>Plan Duration</Label>
                  <FormControl>
                    <Input
                      placeholder="30 days / 3 months / 1 year"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

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
              <ButtonLoading text="Creating Template" />
            ) : (
              "Create Message Template"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
