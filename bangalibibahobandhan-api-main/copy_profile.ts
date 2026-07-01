import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sourceUser = await prisma.user.findUnique({
    where: { publicId: 'BBB52831605' },
    include: { profile: true }
  });

  if (!sourceUser || !sourceUser.profile) {
    console.log("Source profile not found.");
    return;
  }
  
  console.log(`Source Profile: ${sourceUser.firstName} (${sourceUser.gender})`);

  // Find all other users
  const targetUsers = await prisma.user.findMany({
    where: { publicId: { not: 'BBB52831605' } },
    include: { profile: true }
  });

  console.log(`Found ${targetUsers.length} other users. Starting to copy profile details to all of them...`);

  // Data to copy (omit keys that shouldn't be overridden)
  const fieldsToCopy = { ...sourceUser.profile };
  const keysToExclude = ['id', 'userId', 'createdAt', 'updatedAt'];
  keysToExclude.forEach(key => delete (fieldsToCopy as any)[key]);

  let updatedCount = 0;
  
  for (const targetUser of targetUsers) {
    try {
      if (targetUser.profile) {
        await prisma.profile.update({
          where: { id: targetUser.profile.id },
          data: fieldsToCopy
        });
      } else {
         await prisma.profile.create({
            data: {
              ...fieldsToCopy,
              userId: targetUser.id
            }
         });
      }
      updatedCount++;
    } catch (e) {
      console.error(`Failed to update profile for ${targetUser.publicId}:`, e);
    }
  }

  console.log(`Successfully copied profile details to ${updatedCount} profiles!`);
}

main().finally(() => prisma.$disconnect());
