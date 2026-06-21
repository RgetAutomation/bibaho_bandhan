const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const m = await prisma.user.count({ where: { isGhotokOwned: false, isProfilePublic: true, gender: 'MALE' }});
  const f = await prisma.user.count({ where: { isGhotokOwned: false, isProfilePublic: true, gender: 'FEMALE' }});
  console.log('Direct Public Males:', m);
  console.log('Direct Public Females:', f);
}
main().finally(() => prisma.$disconnect());
