export interface ISession {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  team: ISessionUser;
}

export interface ISessionUser {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  avatar: string | null;
}
