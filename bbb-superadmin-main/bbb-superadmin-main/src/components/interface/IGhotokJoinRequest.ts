export interface IGhotokJoinRequest {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  email: string | null;
  phone: string;
  password: string;
  status: string;
}

export enum GhotokJoinRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}
