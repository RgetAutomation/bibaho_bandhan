export interface ICurrentUser {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  avatar: string | null;
  phone: string;
  email: string | null;
  isProfileComplete: boolean;
  role: string;
  accessToken: string;
  refreshToken: string;
}
