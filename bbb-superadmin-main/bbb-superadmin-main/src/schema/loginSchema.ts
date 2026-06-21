import { string, object } from "zod";

export const loginSchema = object({
  email: string()
    .min(10, {
      message: "Email or Mobile number is required",
    })
    .max(50),
  password: string()
    .min(8, {
      message: "Password is required",
    })
    .max(50),
});
