export interface ISaUserConversation {
  id: string;
  participant: ISaUserParticipant;
  messages: ISaUserMessage[];
}

type MessageType = "TEXT" | "PAYMENT" | "PROFILE";
type PaymentStatus = "PENDING" | "VERIFYING" | "APPROVED" | "REJECTED";

export interface ISaUserMessage {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  type: MessageType;
  price?: number;
  paymentPhase?: PaymentStatus;
  status: string;
  createdAt: Date;
  matchingPaymentId?: string | null;
}

export interface ISaUserParticipant {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  avatar: string | null;
}
