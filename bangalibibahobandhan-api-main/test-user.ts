import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ orderBy: { updatedAt: 'desc' }, take: 2 });
  for (const u of users) {
    console.log(u.id, u.type, u.planExpiryDate, u.totalLimit);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
