import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const publicId = process.argv[2];
  if (!publicId) {
    console.error("Please provide a user publicId as an argument. Example: npx tsx src/delete_user.ts BBB12345");
    process.exit(1);
  }
  const result = await prisma.user.deleteMany({ where: { publicId } });
  if (result.count > 0) {
    console.log(`User ${publicId} deleted successfully`);
  } else {
    console.log(`User ${publicId} not found`);
  }
}
main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
