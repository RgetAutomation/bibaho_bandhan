"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import { reportReply } from "@/action/reported";
import ButtonLoading from "@/components/buttonLoading";
//import { useRouter } from "next/navigation";

const replySchema = z.object({
  reply: z
    .string()
    .min(10, {
      message: "Reply must be at least 10 characters.",
    })
    .max(160, {
      message: "Reply must not be longer than 30 characters.",
    }),
});
export default function ReportedUserClient({ reportId }: { reportId: string }) {
  //const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      reply: "",
    },
  });

  async function onSubmit(data: z.infer<typeof replySchema>) {
    setLoading(true);
    try {
      const response = await reportReply(reportId, data.reply);
      if (response.success) {
        toast.success(response.message || "Reply sent successfully.");
        form.reset();
      } else {
        toast.error(
          response.message || "Failed to send reply. Please try again."
        );
      }
    } catch {
      toast.error("Failed to send reply. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="bg-muted-foreground/10 mt-6 rounded-md p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="reply"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reply</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Reply to the user report here..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <ButtonLoading text="Sending..." />
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send Reply</span>
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
