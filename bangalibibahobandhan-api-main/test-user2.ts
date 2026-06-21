import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.user.findUnique({
    where: { publicId: 'BBB32520815' },
    include: { activePlan: true }
  });
  if (!u) {
    console.log('User not found');
  } else {
    console.log('Plan:', u.activePlan?.title);
    console.log('Type:', u.type);
    console.log('TotalLimits:', u.totalLimit);
    console.log('Expiry:', u.planExpiryDate);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
