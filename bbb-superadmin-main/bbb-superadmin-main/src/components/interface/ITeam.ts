export interface ITeams {
  id: string;
  internalId: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  email: string | null;
  phone: string;
  avatar: string | null;
  role: "ADMIN" | "MODERATOR" | "GHOTOK" | "SUPERADMIN";
  blocked: boolean;
  isProfileComplete: boolean;
}

export interface ITeam extends ITeams {
  createdAt: Date;
  profile: ITeamProfile | null;
}

export interface ITeamProfile {
  id: string;
  dob: Date | null;
  identificationProof: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  postOffice: string | null;
  policeStation: string | null;
  dist: string | null;
  state: string | null;
  pinCode: string | null;
}

export interface ITeamUserProfileRequest extends ITeamProfile {
  avatar: string | null;
  status: string;
  createdAt: Date;
  team: Omit<ITeams, "blocked" | "isProfileComplete">;
}

export interface ITeamsForChat {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  avatar: string | null;
  conversationId: string;
  lastMessage: {
    id: string;
    content: string;
    senderTeamId: string | null;
  } | null;
}

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
  type: RoleConversationType;
}

export enum RoleConversationType {
  SUPERADMIN_GHOTOK = "SUPERADMIN_GHOTOK",
  SUPERADMIN_ADMIN = "SUPERADMIN_ADMIN",
  SUPERADMIN_MODERATOR = "SUPERADMIN_MODERATOR",
  GHOTOK_ADMIN = "GHOTOK_ADMIN",
  GHOTOK_MODERATOR = "GHOTOK_MODERATOR",
}

export interface ITeamsForPayment {
  id: string;
  internalId: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  avatar: string | null;
}
