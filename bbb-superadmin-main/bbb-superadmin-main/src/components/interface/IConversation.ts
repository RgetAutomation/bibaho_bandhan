export interface IConversation {
  id: string;
  participants: IConversationUser[];
  messages: IConversationMessages[];
}

export interface IConversationUser {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  avatar: string | null;
}

export interface IConversationMessages {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  status: string; // Update this line
  moderation: {
    reason: string | null;
    status: string | null;
  } | null;
}

export interface IConversationOnly {
  id: string;
  assignedModerator: {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    gender: string | null;
    avatar: string | null;
  } | null;
  hasGhotokParticipant: boolean;
  participant: IConversationUser;
}

export interface IMessagesWithConversation extends IConversationMessages {
  conversation: {
    id: string;
    participants: IConversationUser[];
  };
}
