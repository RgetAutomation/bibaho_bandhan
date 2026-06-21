export interface IAdminModeratorConversationMessages {
  participants: IConversationParticipant[];
  messages: IConversationMessage[];
}

export interface IConversationParticipant {
  id: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  gender: string | null;
  avatar: string | null;
}

export interface IConversationMessage {
  id: string;
  senderTeamId: string | null;
  content: string | null | undefined; // from template?.content
  createdAt: Date;
  status: string;
}
