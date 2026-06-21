import { UserType } from "@/components/enum/userType";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export enum NotPaidUserReason {
  FREE_USER = "FREE_USER",
  PLAN_EXPIRED = "PLAN_EXPIRED",
  PAID_USER = "PAID_USER",
}

export interface IUserPaid {
  paid: boolean;
  reason: NotPaidUserReason;
}

export function isPaidUser(userType: string, planExpiryDate: Date): IUserPaid {
  return userType === UserType.FREE_USER
    ? { paid: false, reason: NotPaidUserReason.FREE_USER }
    : new Date(planExpiryDate) < new Date()
    ? { paid: false, reason: NotPaidUserReason.PLAN_EXPIRED }
    : { paid: true, reason: NotPaidUserReason.PAID_USER };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function detectIdentifierType(
  identifier: string
): "PHONE" | "EMAIL" | "INVALID" {
  const emailSchema = z.email();
  const phoneSchema = z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits only");

  if (emailSchema.safeParse(identifier).success) {
    return "EMAIL";
  }

  if (phoneSchema.safeParse(identifier).success) {
    return "PHONE";
  }

  return "INVALID";
}
