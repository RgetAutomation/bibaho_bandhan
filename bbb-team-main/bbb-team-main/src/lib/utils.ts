import { TeamRole } from "@/components/enum/TeamRole";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function addIdPrefix(id: string, role: TeamRole) {
  if (role === TeamRole.ADMIN) {
    return `#BBBAD${id}`;
  } else if (role === TeamRole.MODERATOR) {
    return `#BBBMD${id}`;
  } else {
    return `#BBBGH${id}`;
  }
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
