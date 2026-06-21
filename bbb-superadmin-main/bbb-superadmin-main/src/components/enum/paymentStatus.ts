export enum PaymentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export function toPaymentStatus(status: string): PaymentStatus | undefined {
  if (Object.values(PaymentStatus).includes(status as PaymentStatus)) {
    return status as PaymentStatus;
  }
  return undefined; // or throw new Error("Invalid status")
}
