export interface ITeamUserConversation {
  team: ITeamUserConversationUser;
  user: ITeamUserConversationUser;
  messages: ITeamUserConversationMessage[];
}

export interface ITeamUserConversationUser {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  avatar: string | null;
  gender: string;
}

export interface ITeamUserConversationMessage {
  id: string;
  senderTeamId: string | null;
  senderUserId: string | null;
  content: string;
  createdAt: Date;
  status: string;
}
