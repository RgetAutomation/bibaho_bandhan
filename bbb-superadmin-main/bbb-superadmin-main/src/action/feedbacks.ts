"use server";

import { IFeedback } from "@/components/interface/IFeedback";
import { IServerResponse } from "@/components/interface/IServerResponse";
import { prisma } from "@/lib/prisma";

export async function getAllFeedbacks(): Promise<IFeedback[]> {
  try {
    const feedbacks = await prisma.feedback.findMany({
      select: {
        id: true,
        rating: true,
        name: true,
        phone: true,
        email: true,
        feedback: true,
        createdAt: true,
      },
    });
    return feedbacks;
  } catch (error) {
    console.error("Error fetching plans:", error);
    return [];
  }
}

export async function deleteFeedbacksById(
  feedbackId: string
): Promise<IServerResponse> {
  try {
    await prisma.feedback.delete({
      where: {
        id: feedbackId,
      },
    });
    return {
      success: true,
      message: "Feedback deleted successfully",
    } as IServerResponse;
  } catch (error) {
    console.error("Error fetching plans:", error);
    return {
      success: false,
      message: "Failed to delete feedback",
    };
  }
}
