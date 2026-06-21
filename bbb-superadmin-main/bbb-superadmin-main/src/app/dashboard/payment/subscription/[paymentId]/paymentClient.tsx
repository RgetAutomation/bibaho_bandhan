"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
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
import { Ban, Hourglass, Loader2, Save, ShieldCheck } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  PaymentStatus,
  toPaymentStatus,
} from "@/components/enum/paymentStatus";
import { useRouter } from "next/navigation";
import { updateSubscriptionPaymentStatus } from "@/action/payment";

const FormSchema = z.object({
  paymentId: z.string().min(3, { error: "User ID is required." }),
  status: z.string().min(3, { error: "Status is required." }),
  feedback: z.string().min(2, { error: "Feedback is required" }),
});

export default function PaymentClientComponent({
  userId,
  paymentId,
}: {
  userId: string;
  paymentId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      paymentId: paymentId,
      status: "PENDING",
      feedback: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    // Handle form submission here
    // For example, send data to the server
    try {
      const response = await updateSubscriptionPaymentStatus(
        userId,
        data.paymentId,
        toPaymentStatus(data.status) ?? PaymentStatus.PENDING,
        data.feedback
      );

      if (response.success) {
        toast.success("Payment status updated successfully.");
        form.reset();
        router.refresh();
      } else {
        toast.error(response.message || "Failed to update payment status.");
      }
    } catch (error) {
      toast.error(
        (error as string) ||
          "Failed to update payment status. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Status <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl className="w-full">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a payment status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PENDING">
                    <Hourglass className="h-4 w-4 text-orange-500" /> PENDING
                  </SelectItem>
                  <SelectItem value="APPROVED">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    APPROVED
                  </SelectItem>
                  <SelectItem value="REJECTED">
                    <Ban className="h-4 w-4 text-red-500" />
                    REJECTED
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Feedback <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea placeholder="Write your feedback" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating Status</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Update Status</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
