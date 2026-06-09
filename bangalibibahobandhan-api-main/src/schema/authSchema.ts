import z, { object, string, enum as ZodEnum } from "zod";

export const registerUserSchema = object({
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
  password: string({ required_error: "Password is required" }).min(8, {
    message: "Password at least 8 characters long",
  }),
});

export const loginUserSchema = object({
  email: string({ required_error: "Email or phone is required" }).min(10, {
    message: "Email or phone at least 10 characters long",
  }),

  password: string({ required_error: "Password is required" }).min(8, {
    message: "Password at least 8 characters long",
  }),
});

export const changePasswordSchema = object({
  oldPassword: string({
    required_error: "Old Password is required",
  }).min(8, {
    message: "Password at least 8 characters long",
  }),
  newPassword: string({
    required_error: "New Password is required",
  })
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
  confirmPassword: string({
    required_error: "Confirm Password is required",
  }).min(8, {
    message: "Confirm Password at least 8 characters long",
  }),
});

export const changeContactDetailsSchema = object({
  phone: string({
    required_error: "Mobile number is required",
  })
    .min(10, {
      message: "Mobile number at least 10 characters long",
    })
    .max(15, {
      message: "Mobile number at most 15 characters long",
    }),
  email: string()
    .optional()
    .refine((val) => {
      if (val) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(val);
      }
      return true;
    }),
});

export const registerSystemUserSchema = object({
  firstName: string().min(3, {
    message: "First Name is required",
  }),
  middleName: string().optional(),
  lastName: string().min(3, {
    message: "Last Name is required",
  }),
  gender: string().min(4, {
    message: "Gender is required",
  }),
  phone: string().min(10, {
    message: "Mobile number should be at least 10 characters",
  }),
  email: string().email({
    message: "Invalid email",
  }),
  password: string()
    .min(1, {
      message: "Password is required",
    })
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Password must contain at least one letter, one number, and one special character"
    ),
});
