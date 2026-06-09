import { Prisma } from "@prisma/client/extension";
import { prisma } from "../config/db.js";

export async function generateConversationId(
  tx: Prisma.TransactionClient
): Promise<string> {
  const prefix = "BBB";
  const tag = "CV";

  // ✅ Determine session (e.g. 2025–2026)
  const now = new Date();
  const year = now.getFullYear();
  const nextYear = (year + 1).toString().slice(-2);
  const session = `${year.toString().slice(-2)}${nextYear}`;

  // ✅ Find latest serial number for this session
  const lastConversation = await tx.conversation.findFirst({
    where: {
      convId: {
        startsWith: `${prefix}${session}${tag}`,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: { convId: true },
  });

  let serial = 1;
  if (lastConversation?.convId) {
    const lastSerial = parseInt(lastConversation.convId.slice(-4)); // get last 4 digits
    serial = lastSerial + 1;
  }

  const formattedSerial = serial.toString().padStart(4, "0");
  return `${prefix}${session}${tag}${formattedSerial}`;
}
