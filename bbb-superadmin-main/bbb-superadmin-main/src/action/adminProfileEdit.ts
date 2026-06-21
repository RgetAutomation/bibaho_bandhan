"use server";

import { prisma } from "@/lib/prisma";
import { IServerResponse } from "@/components/interface/IServerResponse";

export interface ProfileEditHistoryItem {
  id: string;
  sectionName: string;
  previousData: Record<string, unknown>;
  updatedAt: Date;
}

// Typed interface for the history model — avoids referencing the Prisma-generated
// type that won't exist until `prisma generate` has been run.
interface HistoryModel {
  findMany: (args: {
    where: { profileId: string };
    orderBy: { updatedAt: "asc" | "desc" };
  }) => Promise<Array<{ id: string; sectionName: string; previousData: unknown; updatedAt: Date }>>;
  create: (args: {
    data: { profileId: string; sectionName: string; previousData: Record<string, unknown> };
  }) => Promise<unknown>;
}

// Returns the history model delegate if the Prisma client has been regenerated,
// otherwise returns undefined (safe fallback until `prisma generate` is run).
function historyModel(): HistoryModel | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delegate = (prisma as any).profileEditHistory;
  return delegate ?? undefined;
}

/**
 * Updates a section of a user's profile and saves the previous values as history.
 */
export async function updateProfileSection(
  profileId: string,
  sectionName: string,
  newValues: Record<string, string | null>
): Promise<IServerResponse> {
  try {
    // 1. Fetch the current profile to snapshot previous values for that section
    const currentProfile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!currentProfile) {
      return { success: false, message: "Profile not found." };
    }

    // 2. Build previousData snapshot — only the keys being changed
    const previousData: Record<string, unknown> = {};
    for (const key of Object.keys(newValues)) {
      previousData[key] = (currentProfile as Record<string, unknown>)[key] ?? null;
    }

    // 3. Build the update payload — pass values directly
    // (If we convert "" to null, it crashes Prisma for non-nullable fields like religion/caste)
    const updatePayload: Record<string, string | null> = { ...newValues };

    const model = historyModel();

    if (model) {
      // Full path: update profile + write history record atomically
      await prisma.$transaction([
        prisma.profile.update({
          where: { id: profileId },
          data: updatePayload as Parameters<typeof prisma.profile.update>[0]["data"],
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        model.create({ data: { profileId, sectionName, previousData } }) as any,
      ]);
    } else {
      // Fallback: update profile only — history table not ready yet
      await prisma.profile.update({
        where: { id: profileId },
        data: updatePayload as Parameters<typeof prisma.profile.update>[0]["data"],
      });
    }

    return { success: true, message: "Profile updated successfully." };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error updating profile section:", errorMsg);
    return { success: false, message: `Update failed: ${errorMsg}` };
  }
}

/**
 * Fetches all edit history for a given profile, ordered newest first.
 * Returns an empty array if the Prisma client hasn't been regenerated yet.
 */
export async function getProfileEditHistory(
  profileId: string
): Promise<ProfileEditHistoryItem[]> {
  try {
    const model = historyModel();
    if (!model) return []; // Safe: Prisma client not yet regenerated

    const history = await model.findMany({
      where: { profileId },
      orderBy: { updatedAt: "desc" },
    });

    return history.map((h) => ({
      id: h.id,
      sectionName: h.sectionName,
      previousData: h.previousData as Record<string, unknown>,
      updatedAt: h.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching edit history:", error);
    return [];
  }
}
