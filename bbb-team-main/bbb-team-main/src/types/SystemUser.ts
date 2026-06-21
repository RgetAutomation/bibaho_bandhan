import { Role } from "./Role";

export interface SystemUser {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  avatar: string | null;
  email: string;
  phone: string;
  role: Role;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
