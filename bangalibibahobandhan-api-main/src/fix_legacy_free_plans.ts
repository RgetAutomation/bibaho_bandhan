import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('UPDATE "User" SET "hasUsedFreePlan" = true WHERE "totalLimit" = 0');
  console.log('Updated existing free plan users');
}

main().finally(() => prisma.$disconnect());
