export interface IGhotokSaConversations {
  id: string;
  lastMessageAt: Date;
  messages: IGhotokSaMessage[];
  user: IGhotokSaConversationsUser;
}

export interface IGhotokSaConversationsUser {
  id: string;
  publicId: string;
  title: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  avatar: string;
  type: string;
}

export interface IGhotokSaMessage {
  id: string;
  content: string;
  senderId: string;
  type: string;
  createdAt: Date;
}

export interface IGhotokUserSaChat {
  id: string;
  lastMessageAt: Date;
  messages: IGhotokUserSAMessage[];
  userId: string;
}

export interface IGhotokUserSAMessage {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  type: string;
  price?: number;
  paymentPhase?: string;
  status: string;
  createdAt: Date;
}
