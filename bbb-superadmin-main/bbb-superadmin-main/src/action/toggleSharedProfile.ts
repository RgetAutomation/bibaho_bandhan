"use server";

import { prisma } from "@/lib/prisma";

export async function toggleSharedProfile(userId: string, isShared: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { allowSocialPublish: isShared },
    });
    return { success: true };
  } catch (error) {
    console.error("Error toggling shared profile:", error);
    return { success: false, message: "Failed to update profile status." };
  }
}
