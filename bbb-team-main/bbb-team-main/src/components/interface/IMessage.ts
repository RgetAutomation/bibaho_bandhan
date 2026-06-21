export interface IMessage {
  id: string;
  tempId?: string;
  content: string;
  templateId: string;
  conversationId: string;
  senderTeamId: string;
  status: string;
  createdAt: Date;
}

export interface IMessageSet {
  id: string;
  tempId?: string;
  templateId: string;
  conversationId: string;
  senderTeamId: string;
  status: string;
  createdAt: Date;
}
