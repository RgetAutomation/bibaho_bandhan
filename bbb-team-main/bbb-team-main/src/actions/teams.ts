import { IAdminModerator } from "@/components/interface/IAdminModerator";
import { IMatchingConversation } from "@/components/interface/IMatchingConversation";
import { ITeamUserConversations } from "@/components/interface/ITeamUserChat";
import { PaginatedResponse } from "@/components/interface/IUserConversation";
import { IAssignedWork } from "@/components/interface/moderator/IAssignedWork";
import { IModerationMessage } from "@/components/interface/moderator/IModerationMessage";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";

//Get All Admins For Moderator
export async function getAllAdmins(): Promise<IAdminModerator[]> {
  const response = await api.get<AxiosResponse<IAdminModerator[]>>(
    "/app/moderator/admins"
  );
  return response.data.data;
}

// Get All Moderation Messages
export async function getAllModerationMessages(): Promise<
  IModerationMessage[]
> {
  const response = await api.get<AxiosResponse<IModerationMessage[]>>(
    "/app/moderator/messages/moderation"
  );
  return response.data.data;
}

export interface IRejectedMessageTemplate {
  id: string;
  title: string;
  content: string;
}

export async function getAllRejectedMessagesTeamplates(): Promise<
  IRejectedMessageTemplate[]
> {
  const response = await api.get<AxiosResponse<IRejectedMessageTemplate[]>>(
    "/app/moderator/messages/rejected/templates"
  );
  return response.data.data;
}

// Get All Bride Conversations
export async function getAllBrideConversations(): Promise<
  ITeamUserConversations[]
> {
  const response = await api.get<AxiosResponse<ITeamUserConversations[]>>(
    "/conversations/team/user/conversation/all"
  );

  return response.data.data;
}

// Get All Assigned Work
export async function getAllAssignedWork(): Promise<IAssignedWork[]> {
  const response = await api.get<AxiosResponse<IAssignedWork[]>>(
    "/app/moderator/assigned/work"
  );

  return response.data.data;
}

// Get All Starred Conversations
export async function getAllStarredConversations(): Promise<IAssignedWork[]> {
  const response = await api.get<AxiosResponse<IAssignedWork[]>>(
    "/app/moderator/conversations/starred"
  );

  return response.data.data;
}

// Get All Matching Conversations For Moderator
export async function getAllMatchingConversationsForModerator(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<IMatchingConversation[]>> {
  const response = await api.get<
    AxiosResponse<PaginatedResponse<IMatchingConversation[]>>
  >(`/app/moderator/users/conversation/matching?page=${page}&limit=${limit}`);
  return response.data.data;
}

export interface IRejectedMessage {
  id: string;
  conversationId: string;
  convId: string;
  content: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

// Get All Rejected Message
export async function getAllRejectedMessages({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<PaginatedResponse<IRejectedMessage[]>> {
  const response = await api.get<
    AxiosResponse<PaginatedResponse<IRejectedMessage[]>>
  >(`/app/moderator/messages/rejected?page=${page}&limit=${limit}`);
  return response.data.data;
}
