export interface ITeamUserConversations {
  id: string;
  user: ITeamUserChatParticipant;
}

export interface ITeamUserChatParticipant {
  id: string;
  internalId: string;
  gender: string;
}

type MessageType = "TEXT" | "PAYMENT";
type PaymentStatus = "PENDING" | "VERIFYING" | "APPROVED" | "REJECTED";

export interface ITeamUserMessage {
  id: string;
  tempId?: string;
  content: string;
  conversationId: string;
  senderTeamId: string;
  senderUserId: string;
  type: MessageType;
  planId?: string;
  planTitle?: string;
  planPrice?: number;
  planDuration?: number;
  paymentPhase?: PaymentStatus;
  status: string;
  createdAt: Date;
}

export interface ITeamUserChat {
  messages: ITeamUserMessage[];
  participant: ITeamUserChatParticipant;
}
