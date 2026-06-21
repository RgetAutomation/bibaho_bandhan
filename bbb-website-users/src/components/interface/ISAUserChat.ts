export interface ISAUserConversations {
  id: string;
  createdAt: Date;
  lastMessageAt: Date;
  //user: ISAUserChatParticipant;
  messages: ISAUserMessage[];
}

export interface ISAUserChatParticipant {
  id: string;
  internalId: string;
  gender: string;
}

type MessageType = "TEXT" | "PAYMENT" | "PROFILE";

export interface ISAUserMessage {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  status: string;
  createdAt: Date;
  type?: MessageType;
  price?: number;
  paymentPhase?: string;
}

// export interface ITeamUserChat {
//   messages: ITeamUserMessage[];
//   participant: ITeamUserChatParticipant;
// }
