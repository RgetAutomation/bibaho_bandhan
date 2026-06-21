import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
console.log("userSubscription exists:", !!prisma.userSubscription);
