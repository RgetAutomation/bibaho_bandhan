import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const userId = 'x4buH3prR6nx9ixm7I5QOjqOWRHDGo5b'; // BBB13986488
  const profileId = '8IpU99BHYCLleRiJDUFGCHL9XVJjzh1u'; // BBB89656877

  const existing = await prisma.shortlist.findUnique({
    where: {
      userId_profileId: {
        userId,
        profileId,
      },
    },
  });

  if (existing) {
    console.log("Existing found, deleting...");
    await prisma.shortlist.delete({ where: { id: existing.id } });
  } else {
    console.log("Creating new...");
    await prisma.shortlist.create({
      data: { userId, profileId }
    });
    console.log("Created successfully!");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
