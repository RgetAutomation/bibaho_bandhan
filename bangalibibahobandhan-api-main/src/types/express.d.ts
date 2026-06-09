// src/types/express.d.ts
import { Gender } from "./gender";
import { Role } from "./roles";
import { UserType } from "./user-type";

declare global {
  namespace Express {
    interface Request {
      accessToken: string;
      systemUser?: {
        id: string;
        role: Role;
      };
      user: {
        id: string;
        gender: Gender;
        type: UserType;
        planExpiryDate: Date;
      };
      io: Server;
      socketUserMap: Map<string, string>;
    }
  }
}
export {};
