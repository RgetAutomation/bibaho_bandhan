import React from "react";
import SuccessPaymentClient from "./successPaymentClient";

export default async function SuccessPaymentPage({
  params,
}: {
  params: Promise<{ payId: string }>;
}) {
  const { payId } = await params;
  return <SuccessPaymentClient messageId={payId} />;
}
