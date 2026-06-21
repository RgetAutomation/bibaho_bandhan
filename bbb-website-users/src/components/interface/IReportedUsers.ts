export interface IReportedUsers {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  reportedAgainst: {
    title: string;
    lastName: string;
    gender: string;
    avatar: string;
  };
}

export interface IReportedProfile {
  id: string;
  reason: string;
  reply: string;
  screenShotUrl: string;
  status: string;
  createdAt: string;
  reportedAgainst: {
    title: string;
    lastName: string;
    gender: string;
    avatar: string;
  };
}
