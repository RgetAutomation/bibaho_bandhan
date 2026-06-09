import z from "zod";

export const updatePaymentSchecma = z.object({
  paymentDate: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date()
  ),

  amount: z.string().min(1, "Amount is required"),
  upiId: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  feedback: z.string().optional(),
  teamId: z.string().min(1, "Team id is required"),
});
