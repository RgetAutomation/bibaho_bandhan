import { Role } from "./roles.js";
import { UserType } from "./user-type.js";

export interface User {
  id: string;
  gender: string;
  type: UserType;
  planExpiryDate: Date;
  tokenType: "USER";
}

export interface SystemUser {
  id: string;
  role: Role;
  isProfileComplete: boolean;
  tokenType: "TEAM" | "SUPERADMIN";
}
