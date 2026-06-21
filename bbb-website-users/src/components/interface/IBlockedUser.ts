export interface IBlockedUser {
  id: string;
  userId: string;
  title: string;
  lastName: string;
  avatar: string;
  gender?: string;
  profile?: {
    dob: string;
    profession: string;
    dist: string;
    state: string;
  };
  createdAt: string;
}
