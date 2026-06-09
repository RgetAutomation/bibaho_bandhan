import { prisma } from "./config/db.js";

async function main() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        teamaccounts: true,
      }
    });
    console.log("Teams in DB:", JSON.stringify(teams, null, 2));
  } catch (error) {
    console.error("Error querying DB:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
