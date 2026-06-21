import { date } from "zod";
export interface IGhotokUserConversation {
  id: string;
  convId: string;
  messages: IGhotokUserConversationMessage[];
  participants: IGhotokUserConversationUser[];
}

export interface IGhotokUserConversationMessage {
  id: string;
  tempId?: string;
  conversationId: string;
  content: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: Date;
  receiverGender?: string;
  moderation: {
    status: string;
    reason: string;
  } | null;
}

export interface IGhotokUserConversationUser {
  id: string;
  title: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string;
  gender: string;
  avatar: string;
  ghotokId: string;
  isGhotokOwned: boolean;
}
