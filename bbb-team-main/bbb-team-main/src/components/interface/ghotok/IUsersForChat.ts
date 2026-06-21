export interface IGhotokUsersForChat {
  id: string;
  publicId: string;
  title: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  avatar: string;
}

export interface IGhotokUserConversationForChat {
  id: string;
  convId: string;
  participants: IGhotokUserConversationParticipant;
}

export interface IGhotokUserConversationParticipant {
  id: string;
  publicId: string;
  title: string;
  lastName: string;
  gender: string;
  avatar: string;
}
