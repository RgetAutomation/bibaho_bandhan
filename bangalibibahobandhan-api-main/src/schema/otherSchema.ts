import z from "zod";

export const feedbackSchema = z.object({
  rating: z
    .string()
    .min(1, "Rating is required")
    .max(5, "Rating should be between 1 and 5"),
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  phone: z.string().min(10, "Phone is required").max(15, "Phone is too long"),
  email: z.string().optional(),
  message: z
    .string()
    .min(10, "Message should be at least 10 characters")
    .max(500, "Message is too long"),
});

export const createHelpSchema = z.object({
  name: z.string().min(3, "Full name is required"),
  phone: z.string().min(10, "Enter valid contact number").max(15, "Too long"),
  email: z
    .string()
    .optional()
    .refine((val) => {
      if (val) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(val);
      }
      return true;
    }),
  reason: z.string().min(1, "Please select a reason"),
  message: z.string().optional(),
});
