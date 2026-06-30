import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      publicId: { in: ['BBB13986488', 'BBB89656877'] }
    },
    select: { id: true, publicId: true }
  });
  console.log("=== USERS ===");
  console.log(JSON.stringify(users, null, 2));
  console.log("==================");
}

main().finally(() => prisma.$disconnect());
