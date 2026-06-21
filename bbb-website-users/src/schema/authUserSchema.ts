import z, { object, string, enum as ZodEnum } from "zod";

export const registerUserSchema = object({
  firstName: string({
    error: "First name required",
  }).min(3, {
    message: "First name at least 3 characters",
  }),
  middleName: string().optional(),
  lastName: string({ error: "Last name required" }).min(3, {
    message: "Last name should be at least 3 characters",
  }),
  gender: ZodEnum(["MALE", "FEMALE"]),
  dateOfBirth: string({
    error: "Date of birth is required",
  }),
  motherTongue: string({
    error: "Mother tongue is required",
  }),
  mobile: string()
    .min(10, {
      message: "Mobile number should be at least 10 characters",
    })
    .max(15, {
      message: "Mobile number should be at most 15 characters",
    }),
  email: string().optional(),
  password: string()
    .min(8, {
      message: "Password at least 8 characters",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, {
      message: "Password must contain at least one number",
    })
    .regex(/[@$!%*?&]/, {
      message: "Password must contain at least one special character",
    }),
  confirmPassword: string().min(8, {
    message: "Confirm password at least 8 characters",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const registerUserHalfSchema = object({
  gender: ZodEnum(["MALE", "FEMALE"]),
  mobile: string()
    .min(10, {
      message: "Mobile number should be at least 10 characters",
    })
    .max(15, {
      message: "Mobile number should be at most 15 characters",
    }),
  email: string().optional(),
  password: string()
    .min(8, {
      message: "Password at least 8 characters",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, {
      message: "Password must contain at least one number",
    })
    .regex(/[@$!%*?&]/, {
      message: "Password must contain at least one special character",
    }),
  confirmPassword: string().min(8, {
    message: "Confirm password at least 8 characters",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerUserSchema>;

export const personalInfoSchema = registerUserSchema.pick({
  firstName: true,
  middleName: true,
  lastName: true,
  gender: true,
  dateOfBirth: true,
  motherTongue: true,
  mobile: true,
  email: true,
});

export const personalInfoSchemaForMSF = registerUserSchema.pick({
  firstName: true,
  middleName: true,
  lastName: true,
  gender: true,
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;

export const accountSchemaForMSF = registerUserSchema.pick({
  email: true,
  mobile: true,
});

export const accountSchema = registerUserSchema.pick({
  gender: true,
  email: true,
  mobile: true,
  password: true,
  confirmPassword: true,
});

export type AccountInfo = z.infer<typeof accountSchema>;

export const passwordSchema = registerUserSchema
  .pick({
    password: true,
    confirmPassword: true,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const loginUserSchema = object({
  email: string({
    message: "Email required",
  }).min(10, {
    message: "Email or Mobile required",
  }),
  password: string().min(8, {
    message: "Password at least 8 characters",
  }),
});
