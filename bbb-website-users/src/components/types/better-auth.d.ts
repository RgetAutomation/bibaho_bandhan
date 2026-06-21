import { ExtendedUser } from "@/hooks/useAuthSession";
import type { User as BaseUser, Session as BaseSession } from "better-auth";

declare module "better-auth" {
  type User = BaseUser & ExtendedUser;

  interface Session {
    user: User;
  }

  // Extend the sign up endpoint to accept custom fields
  interface SignUpEmailBody {
    title?: string;
    middleName?: string;
    lastName?: string;
    gender?: string;
    phone?: string;
    username?: string;
    displayUsername?: string;
  }
}
