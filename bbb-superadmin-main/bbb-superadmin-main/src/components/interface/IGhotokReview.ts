export interface IGhotokReview {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string | null;
  phone: string;
  avatar: string | null;
  ghotokReviews: IGhotokReviewDetail[];
}

export interface IGhotokReviewDetail {
  id: string;
  rating: number;
  review: string;
  createdAt: Date;
  user: IGhotokReviewUser;
}

export interface IGhotokReviewUser {
  id: string;
  title: string;
  firstName: string;
  middleName: string | null;
  gender: string;
  lastName: string;
  phone: string;
  avatar: string | null;
}
