"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Generate a random 25-character CUID-like string for ID
function generateCuid() {
  return "c" + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 8);
}

export async function createSuccessStory(data: any) {
  try {
    const { title, image, text, isActive } = data;
    const id = generateCuid();
    await prisma.$executeRaw`
      INSERT INTO "SuccessStory" (id, title, image, text, "isActive", "createdAt", "updatedAt")
      VALUES (${id}, ${title}, ${image}, ${text}, ${isActive ?? true}, NOW(), NOW())
    `;
    revalidatePath("/dashboard/success-stories");
    return { success: true, message: "Success Story created successfully!" };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to create Success Story" };
  }
}

export async function updateSuccessStory(id: string, data: any) {
  try {
    const { title, image, text, isActive } = data;
    await prisma.$executeRaw`
      UPDATE "SuccessStory"
      SET title = ${title}, image = ${image}, text = ${text}, "isActive" = ${isActive ?? true}, "updatedAt" = NOW()
      WHERE id = ${id}
    `;
    revalidatePath("/dashboard/success-stories");
    return { success: true, message: "Success Story updated successfully!" };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update Success Story" };
  }
}

export async function toggleSuccessStory(id: string, currentStatus: boolean) {
  try {
    await prisma.$executeRaw`
      UPDATE "SuccessStory"
      SET "isActive" = ${!currentStatus}, "updatedAt" = NOW()
      WHERE id = ${id}
    `;
    revalidatePath("/dashboard/success-stories");
    return { success: true, message: "Success Story status updated!" };
  } catch (error: any) {
    return { success: false, message: "Failed to update status." };
  }
}

export async function deleteSuccessStory(id: string) {
  try {
    await prisma.$executeRaw`
      DELETE FROM "SuccessStory" WHERE id = ${id}
    `;
    revalidatePath("/dashboard/success-stories");
    return { success: true, message: "Success Story deleted successfully!" };
  } catch (error: any) {
    return { success: false, message: "Failed to delete." };
  }
}
