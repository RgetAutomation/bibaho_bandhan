import { MessageStatus } from "../enum/messageStatus";

export interface IConversation {
  id: string;
  lastMessage: {
    senderId: string;
    content: string;
    createdAt: Date;
    messageStatus: MessageStatus;
  };
  participant: {
    id: string;
    title: string;
    lastName: string;
    avatar: string;
    isOnline: boolean;
    lastSeen: Date | null;
  };
  unreadCount: number;
}
