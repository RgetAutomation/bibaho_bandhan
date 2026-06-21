export interface IMatchingConversation {
  id: string;
  status: string;
  message: string;
  conversationId: string;
  convId: string;
  createdAt: Date;
  moderator: IMatchingModerator;
  participants: IMatchingParticipants[];
}

export interface IMatchingParticipants {
  id: string;
  title: string;
  lastName: string;
  gender: string;
  avatar?: string;
}

export interface IMatchingModerator {
  id: string;
  internalId: string;
  gender: string;
}
