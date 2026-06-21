import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const ghotoks = await prisma.team.findMany({
    where: { role: 'GHOTOK' },
    select: { email: true, ghotokPublicId: true, id: true }
  });
  console.log("ALL GHOTOKS:", ghotoks);
}
main().finally(() => prisma.$disconnect());
