export interface IReportedUsers {
  id: string;
  reason: string;
  reply: string;
  status: string;
  user: IReportedUserDetails;
}

export interface IReportedUser {
  id: string;
  reason: string;
  reply: string;
  screenShotUrl: string;
  status: string;
  user: IReportedUserDetails;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReportedUserDetails {
  id: string;
  publicId: string;
  title: string;
  lastName: string;
  gender: string;
  avatar: string | null;
  type: string;
  planExpiryDate: string;
  createdAt: Date;
}
