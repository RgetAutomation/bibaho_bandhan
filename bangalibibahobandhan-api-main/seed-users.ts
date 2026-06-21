import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const FEMALES_DIR = "C:\\Users\\PC\\Desktop\\images for the bbb\\a ghotok\\females";
const MALES_DIR = "C:\\Users\\PC\\Desktop\\images for the bbb\\a ghotok\\males";
const PUBLIC_UPLOADS = "C:\\xampp\\htdocs\\bbbrepo\\bangalibibahobandhan-api-main\\public\\avatars";
const BACKEND_URL = process.env.BETTER_AUTH_URL || "http://localhost:5000";

async function main() {
  if (!fs.existsSync(PUBLIC_UPLOADS)) {
    fs.mkdirSync(PUBLIC_UPLOADS, { recursive: true });
  }

  // Find or Create Ghotoks
  let ghotok1 = await prisma.team.findUnique({ where: { ghotokPublicId: "BBBGH10001" }});
  let ghotok2 = await prisma.team.findUnique({ where: { ghotokPublicId: "BBBGH10002" }});

  if (!ghotok1) {
    ghotok1 = await prisma.team.create({
      data: {
        internalId: Math.floor(Math.random() * 1000000),
        ghotokPublicId: "BBBGH10001",
        firstName: "Ghotok",
        lastName: "One",
        gender: "MALE",
        phone: "9999999991",
        role: "GHOTOK"
      }
    });
  }

  if (!ghotok2) {
    ghotok2 = await prisma.team.create({
      data: {
        internalId: Math.floor(Math.random() * 1000000),
        ghotokPublicId: "BBBGH10002",
        firstName: "Ghotok",
        lastName: "Two",
        gender: "MALE",
        phone: "9999999992",
        role: "GHOTOK"
      }
    });
  }

  // Get free plan
  const freePlan = await prisma.plan.findFirst({ where: { price: "0" }});

  const processDirectory = async (dirPath: string, gender: "MALE" | "FEMALE") => {
    const files = fs.readdirSync(dirPath);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const nameParts = file.split(".")[0].split(" ");
      const firstName = nameParts[0] || "Unknown";
      const lastName = nameParts.slice(1).join(" ") || "Unknown";
      
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, "")}${Math.floor(Math.random() * 1000)}@example.com`;
      const phone = `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`;
      const publicId = `BBB${Math.floor(10000000 + Math.random() * 89999999)}`;

      const ext = path.extname(file);
      const uuid = randomUUID();
      const newFilename = `${uuid}${ext}`;
      const newPath = path.join(PUBLIC_UPLOADS, newFilename);
      
      fs.copyFileSync(path.join(dirPath, file), newPath);
      const avatarUrl = `${BACKEND_URL}/avatars/${newFilename}`;

      const assignedGhotok = i < files.length / 2 ? ghotok1 : ghotok2;

      await prisma.user.create({
        data: {
          publicId,
          title: gender === "MALE" ? "Mr" : "Miss",
          firstName,
          lastName,
          gender,
          email,
          phone,
          avatar: avatarUrl,
          isProfileComplete: true,
          type: "FREE",
          hasUsedFreePlan: true,
          totalLimit: freePlan ? parseInt(freePlan.connection) : 0,
          remainingLimit: freePlan ? parseInt(freePlan.connection) : 0,
          activePlanId: freePlan?.id,
          ghotokId: assignedGhotok?.id,
          isGhotokOwned: true,
          isProfilePublic: true,
          profile: {
            create: {
              dob: new Date(new Date().getFullYear() - 25 - Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
              speciallyAble: false,
              whatsappNumber: phone,
              caste: "General",
              addressLine1: "Example Street 123",
              postOffice: "Example PO",
              policeStation: "Example PS",
              dist: "Kolkata",
              state: "West Bengal",
              pinCode: "700001",
              profession: "Engineer",
              education: "B.Tech",
              religion: "Hindu",
              maritalStatus: "Never Married",
            }
          }
        }
      });
      console.log(`Created user ${firstName} ${lastName} under Ghotok ${assignedGhotok?.ghotokPublicId}`);
    }
  };

  await processDirectory(FEMALES_DIR, "FEMALE");
  await processDirectory(MALES_DIR, "MALE");

  console.log("Seeding complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
