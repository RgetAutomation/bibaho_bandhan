import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const fakeGhotok1 = await prisma.team.findFirst({ where: { ghotokPublicId: 'BBBGH10001' } });
  const fakeGhotok2 = await prisma.team.findFirst({ where: { ghotokPublicId: 'BBBGH10002' } });

  const realGhotok1 = await prisma.team.findFirst({ where: { email: 'ghotokone@gmail.com' } });
  const realGhotok2 = await prisma.team.findFirst({ where: { email: 'sayansarkar720095@gmail.com' } });

  if (fakeGhotok1 && realGhotok1) {
    const updated = await prisma.user.updateMany({
      where: { ghotokId: fakeGhotok1.id },
      data: { ghotokId: realGhotok1.id }
    });
    console.log(`Reassigned ${updated.count} users from fake BBBGH10001 to real Ghotok (ghotokone@gmail.com)`);
  }

  if (fakeGhotok2 && realGhotok2) {
    const updated = await prisma.user.updateMany({
      where: { ghotokId: fakeGhotok2.id },
      data: { ghotokId: realGhotok2.id }
    });
    console.log(`Reassigned ${updated.count} users from fake BBBGH10002 to real Ghotok (sayansarkar720095@gmail.com)`);
  }

  // Delete the fake ghotoks
  if (fakeGhotok1) {
    await prisma.team.delete({ where: { id: fakeGhotok1.id } });
  }
  if (fakeGhotok2) {
    await prisma.team.delete({ where: { id: fakeGhotok2.id } });
  }

  console.log("Successfully fixed the accounts!");
}
main().finally(() => prisma.$disconnect());
