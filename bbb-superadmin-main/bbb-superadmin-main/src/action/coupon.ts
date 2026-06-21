"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCoupon(formData: FormData) {
  try {
    const code = formData.get("code") as string;
    const planId = formData.get("planId") as string;
    const percentageStr = formData.get("percentage") as string;
    
    if (!code || !planId || !percentageStr) {
      return { success: false, message: "Code, Plan, and Percentage are required." };
    }

    const percentage = parseInt(percentageStr, 10);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      return { success: false, message: "Percentage must be between 1 and 100." };
    }

    const upperCode = code.toUpperCase().trim();

    // Ensure code is unique
    const existing = await (prisma as any).coupon.findUnique({
      where: { code: upperCode }
    });

    if (existing) {
      return { success: false, message: "This coupon code already exists." };
    }

    await (prisma as any).coupon.create({
      data: {
        code: upperCode,
        planId,
        percentage,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/coupon");
    return { success: true, message: "Coupon created successfully." };
  } catch (error: any) {
    console.error("Error creating coupon:", error);
    return { success: false, message: error?.message || "Failed to add coupon." };
  }
}

export async function toggleCoupon(id: string, currentStatus: boolean) {
  try {
    await (prisma as any).coupon.update({
      where: { id },
      data: { isActive: !currentStatus },
    });

    revalidatePath("/dashboard/coupon");
    return { success: true, message: "Status updated successfully." };
  } catch (error: any) {
    console.error("Error toggling coupon:", error);
    return { success: false, message: "Failed to update status." };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await (prisma as any).coupon.delete({
      where: { id },
    });
    revalidatePath("/dashboard/coupon");
    return { success: true, message: "Coupon deleted successfully." };
  } catch (error: any) {
    console.error("Error deleting coupon:", error);
    return { success: false, message: "Failed to delete coupon." };
  }
}
