export interface IUserChats {
  id: string;
  convId: string;
  lastMessage: IUserChatMessage;
  participants: IUserChatParticipant[];
}

export interface IUserChatParticipant {
  id: string;
  title: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string;
  gender: string;
  avatar: string;
}

export interface IUserChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
}
