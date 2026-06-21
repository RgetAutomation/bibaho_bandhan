"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDiscount(formData: FormData) {
  try {
    const planId = formData.get("planId") as string;
    const percentageStr = formData.get("percentage") as string;
    
    if (!planId || !percentageStr) {
      return { success: false, message: "Plan and Percentage are required." };
    }

    const percentage = parseInt(percentageStr, 10);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      return { success: false, message: "Percentage must be between 1 and 100." };
    }

    // Deactivate existing discounts for this plan
    await (prisma as any).discount.updateMany({
      where: { planId },
      data: { isActive: false },
    });

    await (prisma as any).discount.create({
      data: {
        planId,
        percentage,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/discounts");
    return { success: true, message: "Discount added successfully." };
  } catch (error: any) {
    console.error("Error creating discount:", error);
    return { success: false, message: error?.message || "Failed to add discount." };
  }
}

export async function toggleDiscount(id: string, currentStatus: boolean, planId: string) {
  try {
    if (!currentStatus) {
      // Activating this one, so deactivate all others for this plan
      await (prisma as any).discount.updateMany({
        where: { planId, id: { not: id } },
        data: { isActive: false },
      });
    }

    await (prisma as any).discount.update({
      where: { id },
      data: { isActive: !currentStatus },
    });

    revalidatePath("/dashboard/discounts");
    return { success: true, message: "Status updated successfully." };
  } catch (error: any) {
    console.error("Error toggling discount:", error);
    return { success: false, message: "Failed to update status." };
  }
}

export async function deleteDiscount(id: string) {
  try {
    await (prisma as any).discount.delete({
      where: { id },
    });
    revalidatePath("/dashboard/discounts");
    return { success: true, message: "Discount deleted successfully." };
  } catch (error: any) {
    console.error("Error deleting discount:", error);
    return { success: false, message: "Failed to delete discount." };
  }
}
