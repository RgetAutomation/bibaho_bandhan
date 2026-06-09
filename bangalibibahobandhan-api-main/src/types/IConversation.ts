import { MessageStatus } from "@prisma/client";

export interface IConversation {
  id: string;
  lastMessage: {
    senderId?: string;
    content?: string;
    createdAt?: Date;
    status?: string;
  } | null;
  participant: {
    id: string;
    title: string;
    lastName: string;
    avatar: string | null;
    isOnline: boolean;
    lastSeen: Date | null;
  };
  unreadCount: number;
}
