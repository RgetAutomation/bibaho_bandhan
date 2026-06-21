import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import React from "react";
import LoginSessionClient from "../sessions/loginSessionClient";
import { getSuperAdminSessions } from "@/action/sessions";

export default async function MySessionsPage() {
  const user = await checkAuthAndGetSession(await headers());
  const sessions = await getSuperAdminSessions(user.id);

  return (
    <div className="flex flex-1 flex-col">
      <LoginSessionClient sessions={sessions} title="My Login Sessions" />
    </div>
  );
}
