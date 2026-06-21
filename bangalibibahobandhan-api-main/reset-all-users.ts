import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching free plan...");
  // Get free plan
  const freePlan = await prisma.plan.findFirst({ where: { price: "0" }});
  
  if (!freePlan) {
    return console.log("Free plan not found");
  }

  const durationMs = parseInt(freePlan.duration) * 24 * 60 * 60 * 1000;
  const today = new Date();
  const expiry = new Date(today.getTime() + durationMs);

  console.log("Clearing history...");
  // Delete all existing user subscriptions
  await prisma.userSubscription.deleteMany({});

  // Delete payment history for all users
  await prisma.payment.deleteMany({});

  console.log("Resetting all users to Free Plan starting today...");
  
  // Reset all users to only have free plan
  await prisma.user.updateMany({
    data: {
      type: "FREE",
      totalLimit: parseInt(freePlan.connection),
      remainingLimit: parseInt(freePlan.connection),
      hasUsedFreePlan: true,
      activePlanId: freePlan.id,
      planStartDate: today,
      planExpiryDate: expiry
    }
  });

  // Get all users to insert subscriptions
  const users = await prisma.user.findMany({ select: { id: true } });
  
  console.log(`Creating Free Plan subscriptions for ${users.length} users...`);
  
  // Create subscriptions in chunks
  const chunkSize = 1000;
  for (let i = 0; i < users.length; i += chunkSize) {
    const chunk = users.slice(i, i + chunkSize);
    await prisma.userSubscription.createMany({
      data: chunk.map(user => ({
        userId: user.id,
        planId: freePlan.id,
        startDate: today,
        expiryDate: expiry,
        isActive: true
      }))
    });
  }

  console.log("All user histories have been completely cleared and reset to start the Free Plan from today!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
