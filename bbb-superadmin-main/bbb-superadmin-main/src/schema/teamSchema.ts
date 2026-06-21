import z, { email, object, string } from "zod";

export const createTeamSchema = object({
  firstName: string().min(2, "First name is required"),
  middleName: string().optional(),
  lastName: string().min(2, "Last name is required"),
  gender: string().min(4, "Gender is required"),
  phone: string().min(10, "Phone number is required"),
  email: email(),
  password: string().min(6, "Password must be at least 6 characters"),
  role: string().min(4, "Role is required"),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
