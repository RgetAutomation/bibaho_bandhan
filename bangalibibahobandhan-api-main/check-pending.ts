import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { verificationStatus: "PENDING", isProfileComplete: true },
    select: { id: true, firstName: true, verificationStatus: true, isProfileComplete: true }
  });

  console.log("Users with PENDING status:");
  console.log(users);
  
  const allUsers = await prisma.user.findMany({
    select: { id: true, verificationStatus: true },
    take: 5
  });
  console.log("Sample of all users:");
  console.log(allUsers);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
