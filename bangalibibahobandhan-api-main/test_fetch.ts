import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const userId = '8IpU99BHYCLleRiJDUFGCHL9XVJjzh1u'; // BBB89656877 is checking who shortlisted them

  const shortlists = await prisma.shortlist.findMany({
    where: { profileId: userId },
    include: {
      user: {
        select: {
          id: true,
          publicId: true,
          title: true,
          firstName: true,
          lastName: true,
          gender: true,
          avatar: true,
          isGhotokOwned: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const profiles = shortlists.map((s: any) => s.user);

  console.log("=== PROFILES RETURNED BY API ===");
  console.log(JSON.stringify(profiles, null, 2));
  console.log("================================");
}

main().catch(console.error).finally(() => prisma.$disconnect());
