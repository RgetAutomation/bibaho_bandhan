export interface IOldConversation {
  id: string;
  convId: string;
  participants: IOldConversationUser[];
  lastMessage: IOldConversationMessages;
}

export interface IOldConversationUser {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  avatar: string | null;
}

export interface IOldConversationMessages {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  status: string;
}
