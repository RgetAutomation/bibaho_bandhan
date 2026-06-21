export interface ISAChat {
  id: string;
  messages: ISAChatMessage[];
  participants: ISAChatParticipant;
}

export interface ISAChatParticipant {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  avatar: string;
}

export interface ISAChatMessage {
  id: string;
  tempId?: string;
  content: string;
  conversationId: string;
  senderTeamId: string;
  status: string;
  createdAt: Date;
}
