import { IAdminModerator } from "@/components/interface/IAdminModerator";
import { IApiRespone } from "@/components/interface/IApiRespone";
import { IAssignedAuditLogs } from "@/components/interface/IConversationAuditLogs";
import {
  IHelpRequest,
  IHelpRequestSingle,
} from "@/components/interface/IHelpRequest";
import { IMatchingConversation } from "@/components/interface/IMatchingConversation";
import { ITeamUserConversations } from "@/components/interface/ITeamUserChat";
import {
  IUserConversation,
  PaginatedResponse,
} from "@/components/interface/IUserConversation";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";

// Get all conversations of a user
export async function getAllConversations(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<IUserConversation[]>> {
  const response = await api.get<
    AxiosResponse<PaginatedResponse<IUserConversation[]>>
  >(`/app/admin/users/groom/conversations?page=${page}&limit=${limit}`);
  return response.data.data;
}

// Get all conversations audit logs of a user
export async function getAllConversationsAuditLogs(
  page: number = 1,
  limit: number = 10,
  days: string = "7"
): Promise<PaginatedResponse<IAssignedAuditLogs[]>> {
  const response = await api.get<
    AxiosResponse<PaginatedResponse<IAssignedAuditLogs[]>>
  >(
    `/app/admin/users/conversation/assign/logs?page=${page}&limit=${limit}&days=${days}`
  );
  return response.data.data;
}

// Get all matching conversations between users and super admin
export async function getAllMatchingConversations(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<IMatchingConversation[]>> {
  const response = await api.get<
    AxiosResponse<PaginatedResponse<IMatchingConversation[]>>
  >(`/app/admin/users/conversation/matching?page=${page}&limit=${limit}`);
  return response.data.data;
}

// Get all moderators
export async function getAllModerators(): Promise<IAdminModerator[]> {
  const response = await api.get<AxiosResponse<IAdminModerator[]>>(
    "/app/admin/moderators"
  );
  return response.data.data;
}

// Get all grooms conversations
export async function getAllGroomsConversations(): Promise<
  ITeamUserConversations[]
> {
  const response = await api.get<AxiosResponse<ITeamUserConversations[]>>(
    "/conversations/team/user/conversation/all"
  );
  return response.data.data;
}

// Get all help requests
export async function getAllHelpRequests(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<IHelpRequest[]>> {
  const response = await api.get<
    AxiosResponse<PaginatedResponse<IHelpRequest[]>>
  >(`/app/admin/request/help?page=${page}&limit=${limit}`);
  return response.data.data;
}

export async function getSingleHelpRequestById(
  requestId: string
): Promise<IHelpRequestSingle> {
  console.log("requestId in getSingleHelpRequestById", requestId);
  const response = await api.get<IApiRespone<IHelpRequestSingle>>(
    `/app/admin/request/help/${requestId}`
  );
  return response.data.data;
}

export interface IHelpRequestMessage {
  id: string;
  helpRequestId: string;
  senderType: "GUEST" | "TEAM";
  senderId: string | null;
  content: string;
  createdAt: string;
  teamSender: {
    firstName: string;
    lastName: string;
    avatar: string | null;
    internalId: number;
    role: string;
  } | null;
}

export async function getHelpRequestMessages(
  requestId: string,
): Promise<IHelpRequestMessage[]> {
  const response = await api.get<AxiosResponse<IHelpRequestMessage[]>>(
    `/other/help/request/${requestId}/messages`
  );
  return response.data.data;
}

export async function sendAdminHelpMessage(
  requestId: string,
  content: string,
) {
  const res = await api.post(`/app/admin/request/help/${requestId}/messages`, {
    content,
  });
  return res.data;
}
