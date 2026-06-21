import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const ghotoks = await prisma.team.findMany({
    where: { ghotokPublicId: { in: ['BBBGH10001', 'BBBGH10002'] } }
  });
  console.log("GHOTOKS:", ghotoks.map(g => ({ id: g.id, publicId: g.ghotokPublicId, email: g.email })));

  // also see a couple users under them
  const brides = await prisma.user.findMany({
    where: { ghotokId: { in: ghotoks.map(g => g.id) }, gender: "FEMALE" },
    select: { id: true, firstName: true, ghotokId: true, isGhotokOwned: true }
  });
  console.log("BRIDES COUNT:", brides.length);
  if (brides.length > 0) console.log("SAMPLE BRIDE:", brides[0]);
}
main().finally(() => prisma.$disconnect());
