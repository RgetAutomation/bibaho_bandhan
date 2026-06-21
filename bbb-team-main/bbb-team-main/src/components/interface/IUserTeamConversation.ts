export interface IUserTeamConversation {
  user: {
    id: string;
    title: string;
    lastName: string;
    avatar: string;
  };
  team: {
    id: string;
    title: string;
    lastName: string;
    avatar: string;
  };
  messages: ITeamMessage[];
}

export interface ITeamUserConversationUser {
  id: string;
  title: string;
  lastName: string;
  avatar: string;
}

export interface ITeamMessage {
  id: string;
  tempId?: string;
  conversationId: string;
  senderTeamId?: string;
  senderUserId?: string;
  content: string;
  status: string;
  createdAt: Date;
}
