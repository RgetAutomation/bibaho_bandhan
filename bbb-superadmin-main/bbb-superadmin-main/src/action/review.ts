"use server";

import { IGhotokReview } from "@/components/interface/IGhotokReview";
import { prisma } from "@/lib/prisma";

export async function getAllGhotokReviewsById(
  id: string
): Promise<IGhotokReview | null> {
  try {
    const ghotokReviews = await prisma.team.findFirst({
      where: { id: id },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        ghotokReviews: {
          select: {
            id: true,
            rating: true,
            review: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                title: true,
                firstName: true,
                middleName: true,
                lastName: true,
                gender: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
    return ghotokReviews;
  } catch (error) {
    console.error("Error fetching plans:", error);
    return null;
  }
}
