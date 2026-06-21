"server only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export enum SessionType {
  USER = "USER",
  SESSION = "SESSION",
  BOTH = "BOTH",
}

export interface ISession {
  session: ILoggedInSession;
  user: ILoggedInUser;
}

export interface ILoggedInSession {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress: string | null | undefined;
  userAgent: string | null | undefined;
}

export interface ILoggedInUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
  username?: string | null | undefined;
  displayUsername?: string | null | undefined;
  internalId: number;
  lastName: string;
  gender: string;
  phone: string;
  role: string;
  middleName?: string | null | undefined;
  isProfileComplete?: boolean | null | undefined;
}

/* ---------------------------
   ✅ Type-safe overloads
---------------------------- */
export function getLoggedInSession(
  sessionType: SessionType.USER | undefined
): Promise<ILoggedInUser | undefined>;
export function getLoggedInSession(
  sessionType: SessionType.SESSION
): Promise<ILoggedInSession | undefined>;
export function getLoggedInSession(
  sessionType: SessionType.BOTH
): Promise<ISession | undefined>;

/* ---------------------------
   ✅ Implementation
---------------------------- */
export async function getLoggedInSession(
  sessionType: SessionType = SessionType.USER
): Promise<ILoggedInUser | ILoggedInSession | ISession | undefined> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (sessionType === SessionType.SESSION)
    return session?.session as ILoggedInSession;
  if (sessionType === SessionType.BOTH) return session as ISession;

  return session?.user as ILoggedInUser;
}
