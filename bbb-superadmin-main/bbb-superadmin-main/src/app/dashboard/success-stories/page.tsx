import { prisma } from "@/lib/prisma";
import SuccessStoriesClient from "./SuccessStoriesClient";

export default async function SuccessStoriesPage() {
  // Using queryRaw because the Prisma client might not be regenerated yet
  const stories = await prisma.$queryRaw`SELECT * FROM "SuccessStory" ORDER BY "createdAt" DESC` as any[];

  return (
    <div className="flex flex-col gap-6 p-6">
      <SuccessStoriesClient initialStories={stories} />
    </div>
  );
}
