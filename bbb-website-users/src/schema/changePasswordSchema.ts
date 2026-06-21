import { boolean, object, string } from "zod";

export const changePasswordSchema = object({
  oldPassword: string().min(8, {
    message: "Password at least 8 characters long",
  }),
  newPassword: string()
    .min(8, {
      message: "New Password at least 8 characters long",
    })
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  confirmPassword: string().min(8, {
    message: "Confirm Password at least 8 characters long",
  }),
  revokeOtherSessions: boolean(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});
