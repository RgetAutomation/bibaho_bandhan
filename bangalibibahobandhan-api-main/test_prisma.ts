import { PrismaClient } from "@prisma/client";
import { updateUserProfileSchema } from "./src/schema/userSchema.js";

const prisma = new PrismaClient();

async function main() {
  const profileData = {
    dob: "1995-05-15",
    maritalStatus: "SINGLE",
    speciallyAble: false,
    whatsappNumber: "9876543210",
    caste: "GENERAL",
    addressLine1: "123 Test St",
    postOffice: "Test",
    policeStation: "Test",
    dist: "Test",
    state: "Test",
    pinCode: "700001",
    profession: "Software Engineer",
    education: "B.Tech",
    religion: "HINDU"
  };

  try {
    const user = await prisma.user.findFirst();
    if (!user) return console.log("No user found");
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        profile: {
          upsert: {
            create: { ...profileData },
            update: { ...profileData },
          },
        },
      },
    });
    console.log("Success");
  } catch (error) {
    console.error("Prisma error:", error);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
