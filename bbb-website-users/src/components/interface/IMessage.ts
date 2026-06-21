import { MessageStatus } from "../enum/messageStatus";

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  status: MessageStatus;
  tempId?: string;
  moderation: {
    status: string;
    reason: string;
  } | null;
}

export interface IMessageSet {
  id: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  content: string;
  createdAt: Date;
  status: MessageStatus;
  moderation: {
    status: string;
    reason: string;
  } | null;
}
