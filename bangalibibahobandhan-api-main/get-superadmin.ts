import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const superadmins = await prisma.team.findMany({
    where: { role: "ADMIN" }, // Or SUPERADMIN if it exists in TeamRole
  });

  if (superadmins.length === 0) {
    console.log("No superadmins found.");
    return;
  }

  console.log("Found Admins/Superadmins:");
  for (const admin of superadmins) {
    console.log(`- ID: ${admin.id}`);
    console.log(`- Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`- Email (Login ID): ${admin.email}`);
    console.log(`- Phone: ${admin.phone}`);
    console.log("------------------------");
    
    // Optionally reset password for the first one found:
    const hashedPassword = await bcrypt.hash("12345678", 10);
    await prisma.teamAccount.updateMany({
      where: { userId: admin.id },
      data: { password: hashedPassword },
    });
    console.log(`Password for ${admin.email} has been reset to: 12345678`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
