"server only";

import {
  getLoggedInSession,
  ILoggedInUser,
  SessionType,
} from "@/components/helper/getSession";
import { redirect } from "next/navigation";
import LoginClient from "./loginClient";

export default async function LoginPage() {
  const session: ILoggedInUser | undefined = await getLoggedInSession(
    SessionType.USER
  );
  if (session?.id) {
    redirect("/dashboard");
  }

  return <LoginClient />;
}
