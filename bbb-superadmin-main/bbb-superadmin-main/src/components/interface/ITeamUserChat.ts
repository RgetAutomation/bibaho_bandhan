export interface ITeamUserConversations {
  id: string;
  user: ITeamUserChatParticipant;
  lastMessage: ITeamUserMessage;
}

export interface ITeamUserChatParticipant {
  id: string;
  title: string;
  lastName: string;
  gender: string;
  avatar: string;
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
  planId?: string | null;
  planTitle?: string | null;
  planPrice?: number;
  planDuration?: number;
  paymentPhase?: PaymentStatus;
  status: string;
  createdAt: Date;
  receiverGender?: string;
  senderTeam?: {
    internalId: number;
    role: string;
  };
}

export interface ITeamUserChat {
  messages: ITeamUserMessage[];
  participant: ITeamUserChatParticipant;
}
