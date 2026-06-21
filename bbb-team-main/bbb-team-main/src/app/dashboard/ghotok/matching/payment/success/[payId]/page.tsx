import React from "react";
import SuccessPaymentClient from "./successPaymentClient";
import { checkRoleAndGetSession } from "@/components/helper/checkRoleAndGetSession";
import { Role } from "@/types/Role";

export default async function SuccessPaymentPage({
  params,
}: {
  params: Promise<{ payId: string }>;
}) {
  const { payId } = await params;
  await checkRoleAndGetSession([Role.GHOTOK]);
  return <SuccessPaymentClient messageId={payId} />;
}
