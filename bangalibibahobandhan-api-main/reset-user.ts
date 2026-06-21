import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { publicId: "BBB32520815" } });
  if (!user) return console.log("User not found");

  console.log("User before reset:", user.type, user.totalLimit, user.planExpiryDate);

  // Get free plan
  const freePlan = await prisma.plan.findFirst({ where: { price: "0" }});
  
  if (!freePlan) return console.log("Free plan not found");

  // Delete all existing user subscriptions
  await prisma.userSubscription.deleteMany({
    where: { userId: user.id }
  });

  // Delete payment history for this user to make it completely fresh
  await prisma.payment.deleteMany({
    where: { userId: user.id }
  });

  const durationMs = parseInt(freePlan.duration) * 24 * 60 * 60 * 1000;
  const expiry = new Date(Date.now() + durationMs);

  // Reset user to only have free plan
  await prisma.user.update({
    where: { publicId: "BBB32520815" },
    data: {
      type: "FREE",
      totalLimit: parseInt(freePlan.connection),
      remainingLimit: parseInt(freePlan.connection),
      hasUsedFreePlan: true,
      activePlanId: freePlan.id,
      planExpiryDate: expiry
    }
  });

  // Add free plan to UserSubscription so it locks
  await prisma.userSubscription.create({
    data: {
      userId: user.id,
      planId: freePlan.id,
      startDate: new Date(),
      expiryDate: expiry,
      isActive: true
    }
  });

  console.log("User successfully reset to FREE plan only! You can now test buying paid plans.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
