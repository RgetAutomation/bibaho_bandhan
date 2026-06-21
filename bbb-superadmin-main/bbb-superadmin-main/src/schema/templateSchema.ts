import z from "zod";

export const chatTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  content: z.string().min(1).max(2000),
  //category: z.string().min(1).max(50),
  roles: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
});

export const rejectTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  content: z.string().min(1).max(2000),
});
