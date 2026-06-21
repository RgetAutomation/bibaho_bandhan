export interface IReportedUsers {
  id: string;
  screenShotUrl: string | null;
  reason: string;
  reply: string | null;
  userType: string;
  createdAt: Date;
  reportedAgainst: IReportedUser;
  reporter: IReportedUserTeam;
  status: string;
}

export interface IReportedUser {
  id: string;
  title: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  phone: string;
  gender: string;
  avatar: string | null;
  blocked: boolean;
}

export interface IReportedUserTeam {
  id: string;
  title: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  phone: string;
  gender: string;
  avatar: string | null;
  blocked: boolean;
}

export interface IReportedTeam {
  id: string;
  reason: string;
  reply: string | null;
  createdAt: Date;
  status: string;
  user: IReportedUser;
  team: IReportedTeamUser;
}

export interface IReportedTeamUser {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  avatar: string | null;
  gender: string;
}
