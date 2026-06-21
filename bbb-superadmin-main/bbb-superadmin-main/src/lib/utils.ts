import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function addIdPrefix(id: string, role: string) {
  if (role === "ADMIN") {
    return `#BBBAD${id}`;
  } else if (role === "MODERATOR") {
    return `#BBBMD${id}`;
  } else {
    return `#BBBGH${id}`;
  }
}

export function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumberTwoDecimal(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateStrongPassword(length: number = 8): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "@#$%&";

  const allChars = uppercase + lowercase + digits + special;

  // Ensure at least one char from each set
  const getRandom = (chars: string) =>
    chars[Math.floor(Math.random() * chars.length)];

  let password = [
    getRandom(uppercase),
    getRandom(lowercase),
    getRandom(digits),
    getRandom(special),
  ];

  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password.push(getRandom(allChars));
  }

  // Shuffle to avoid predictable order
  password = password.sort(() => Math.random() - 0.5);

  return password.join("");
}

export function generateInternalId(
  role: "ADMIN" | "MODERATOR" | "GHOTOK",
  lastId: number = 0
): number {
  const roleBaseIds: Record<string, number> = {
    ADMIN: 1000,
    MODERATOR: 5000,
    GHOTOK: 10000,
  };

  // 2. Compute new internalId
  const startId = roleBaseIds[role] ?? 1; // default if not listed
  // If no lastId OR lastId is 0 → start from base
  if (!lastId || lastId === 0) {
    return startId;
  }

  // Otherwise increment
  return lastId + 1;
}

export function getIdPrefix(
  id: number,
  role: "ADMIN" | "MODERATOR" | "GHOTOK" | "SUPERADMIN"
) {
  if (role === "ADMIN") {
    return `BBBAD${id}`;
  } else if (role === "MODERATOR") {
    return `BBBMD${id}`;
  } else {
    return `BBBGH${id}`;
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
