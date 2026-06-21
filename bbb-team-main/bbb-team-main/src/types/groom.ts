export enum UserType {
  FREE_USER = "FREE",
  PAID_USER = "PAID",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export interface Groom {
  id: string;
  publicId: string;
  title: string;
  lastName: string;
  gender: Gender;
  avatar: string | null;
  type: UserType;
  dist?: string;
  state?: string;
  createdAt?: string;
  planExpiryDate?: string;
  matchingExpiryDate?: string;
  matchingStartDate?: string;
}
