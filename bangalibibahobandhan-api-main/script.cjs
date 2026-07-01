const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const source = await prisma.userProfile.findFirst({
    where: { publicId: 'BBB52831605' }
  });

  if (!source) {
    console.log("Source profile BBB52831605 not found.");
    return;
  }
  
  console.log("Found source profile:", source.publicId, source.gender);

  const targets = await prisma.userProfile.findMany({
    take: 10,
    select: { id: true, publicId: true, gender: true, firstName: true }
  });
  
  console.log("Target candidates:", targets);
}

main().finally(() => prisma.$disconnect());
