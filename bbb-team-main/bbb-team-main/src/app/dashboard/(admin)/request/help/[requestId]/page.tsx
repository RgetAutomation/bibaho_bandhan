import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";
import React from "react";
import RequestClientPage from "./requestClient";

export default async function SingleRequestPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const user = await checkRoleAndGetSession([Role.ADMIN]);
  return <RequestClientPage requestId={requestId} currentUserId={user.id} />;
}
