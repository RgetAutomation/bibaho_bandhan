export interface IMatchedUsers {
  id: string;
  title: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string | null;
  avatar: string | null;
  type: string;
  isGhotokOwned: boolean;
  matchingStartDate: Date;
  matchingExpiryDate: Date;
  isExipired: boolean;
}
