import z from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(1, {
    message: "First Name is required",
  }),
  middleName: z.string().optional(),
  lastName: z.string().min(1, {
    message: "Last Name is required",
  }),
  gender: z.enum(["MALE", "FEMALE"]),
  phone: z.string().min(10, {
    message: "Phone number is required",
  }),
});
