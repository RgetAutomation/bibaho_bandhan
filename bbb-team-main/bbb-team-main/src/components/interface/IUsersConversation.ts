export interface IUsersConversation {
  id: string;
  participants: IUsersConversationUser[];
  messages: IUsersConversationMessages[];
}

export interface IUsersConversationUser {
  id: string;
  title: string;
  lastName: string;
  gender: string;
}

interface IUsersConversationMessages {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  status: string; // Update this line
}
