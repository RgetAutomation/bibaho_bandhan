import { object, string, enum as ZodEnum } from "zod";

export const createGhotokUserSchema = object({
  firstName: string({ required_error: "First name is required" }).min(3, {
    message: "First name at least 3 characters long",
  }),
  middleName: string().optional(),
  lastName: string({ required_error: "Last name is required" }).min(3, {
    message: "Last name at least 3 characters long",
  }),
  gender: ZodEnum(["MALE", "FEMALE"]),
  email: string()
    .optional()
    .refine((val) => {
      if (val) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(val);
      }
      return true;
    }),
  phone: string({ required_error: "Mobile number is required" })
    .min(10, {
      message: "Mobile number at least 10 characters long",
    })
    .max(15, {
      message: "Mobile number at most 15 characters long",
    }),
});
