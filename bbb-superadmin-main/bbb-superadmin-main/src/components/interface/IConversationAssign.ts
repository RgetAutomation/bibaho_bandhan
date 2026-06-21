import { Gender } from "@prisma/client";
import { IPaginatedResult } from "./IPagenation";

export interface IConversationParticipants {
  id: string;
  title: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string | null;
  gender: Gender;
  avatar: string | null;
}

export interface IConversationListItem {
  id: string;
  convId: string;
  participants: IConversationParticipants[];
}

export interface IConversationAssignModerator {
  id: string;
  internalId: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  avatar: string | null;
}

export interface IConversationAssignAdmin {
  id: string;
  internalId: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  avatar: string | null;
}

export interface IGroomConversationsWithModeratorsResult {
  conversations: IPaginatedResult<IConversationListItem[]>;
  moderators: IConversationAssignModerator[];
}

export interface ITotalConversationsAssaigned {
  conversation: IConversationListItem;
  admin: IConversationAssignAdmin;
  moderator: IConversationAssignModerator;
}
