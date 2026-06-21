export interface IMatchingRoom {
  id: string;
  status: string;
  message: string | null;
  createdAt: Date;
  moderator: IMatchingRoomTeam;
  conversation: {
    id: string;
    participants: IMatchingRoomUser[];
    messages: IMatchingRoomMessage[];
  };
}

export interface IMatchingRoomUser {
  id: string;
  publicId: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  avatar: string | null;
  isGhotokOwned: boolean;
}

export interface IMatchingRoomTeam {
  id: string;
  internalId: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  avatar: string | null;
}

export interface IMatchingRoomMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  status: string;
}
