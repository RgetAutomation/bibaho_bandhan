export interface IGhotok {
  id: string;
  ghotokPublicId: string;
  gender: "MALE" | "FEMALE";
  averageRating: number;
  reviewCount: number;
  yourReview: {
    rating: number;
    review: string;
    updatedAt: Date;
  };
}
