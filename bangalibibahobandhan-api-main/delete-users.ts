import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const publicIds = [
    "BBB58604980",
    "BBB43445720",
    "BBB56249203",
    "BBB32520815",
    "BBB78634898"
  ];

  console.log("Starting deletion of users:", publicIds.join(", "));

  for (const publicId of publicIds) {
    try {
      const user = await prisma.user.findUnique({
        where: { publicId }
      });

      if (!user) {
        console.log(`User ${publicId} not found. Skipping.`);
        continue;
      }

      await prisma.user.delete({
        where: { id: user.id }
      });

      console.log(`Successfully deleted user ${publicId}`);
    } catch (error) {
      console.error(`Error deleting user ${publicId}:`, error);
    }
  }

  console.log("Deletion process completed.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
