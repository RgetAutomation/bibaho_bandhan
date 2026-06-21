export interface IHistoryTeamUserConv {
  id: string;
  user: IHistoryTeamUserConvUser;
}

export interface IHistoryAdminModeratorConv {
  id: string;
  participants: IHistoryTeamUserConvUser;
}

export interface IHistoryTeamUserConvUser {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  avatar: string | null;
}
