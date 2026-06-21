"use server";

import { IServerResponse } from "@/components/interface/IServerResponse";
import { prisma } from "@/lib/prisma";
import { IPlan } from "@/components/interface/IPlan";

// function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

export async function getAllPlan(): Promise<IPlan[]> {
  try {
    const plans = await prisma.plan.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        duration: true,
        connection: true,
        status: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return plans;
  } catch (error) {
    console.error("Error fetching plans:", error);
    return [];
  }
}

export async function getPlanById(id: string): Promise<IPlan> {
  try {
    const plan = await prisma.plan.findUnique({ where: { id } });
    return plan as IPlan;
  } catch (error) {
    console.error("Error fetching plan:", error);
    return {} as IPlan;
  }
}

export async function savePlan(plan: IPlan): Promise<IServerResponse> {
  try {
    await prisma.plan.create({ data: plan });

    return {
      success: true,
      message: "Plan saved successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error saving plan:", error);
    return {
      success: false,
      message: "Failed to save plan.",
    } as IServerResponse;
  }
}

export async function updatePlan(plan: IPlan): Promise<IServerResponse> {
  try {
    await prisma.plan.update({ where: { id: plan.id }, data: plan });

    return {
      success: true,
      message: "Plan updated successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error updating plan:", error);
    return {
      success: false,
      message: "Failed to update plan.",
    } as IServerResponse;
  }
}

export async function updatePlanStatus(
  id: string,
  status: boolean
): Promise<IServerResponse> {
  try {
    await prisma.plan.update({ where: { id }, data: { status } });
    return {
      success: true,
      message: "Plan status updated successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error updating plan status:", error);
    return {
      success: false,
      message: "Failed to update plan status.",
    } as IServerResponse;
  }
}

export async function deletePlan(id: string): Promise<IServerResponse> {
  try {
    const plan = await prisma.plan.findUnique({ where: { id } });
    if (plan && plan.price === "0") {
      return {
        success: false,
        message: "The default FREE Plan cannot be deleted.",
      } as IServerResponse;
    }

    await prisma.plan.delete({ where: { id } });

    return {
      success: true,
      message: "Plan deleted successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error deleting plan:", error);
    return {
      success: false,
      message: "Failed to delete plan.",
    } as IServerResponse;
  }
}
