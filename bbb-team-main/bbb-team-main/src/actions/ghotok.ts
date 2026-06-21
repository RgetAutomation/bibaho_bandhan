import { IConnectionRequest } from "@/components/interface/ghotok/IConnectionRequest";
import { IGhotokSaConversations } from "@/components/interface/ghotok/IGhotokSaChat";
import {
  IGhotokUser,
  IGhotokUserProfile,
  IGhotokUserProfileEdit,
} from "@/components/interface/ghotok/IGhotokUser";
import { IGhotokUserConversation } from "@/components/interface/ghotok/IGhotokUserConversation";
import { IGhotokUserStatus } from "@/components/interface/ghotok/IGhotokUserStatus";
import { IMatchedUsers } from "@/components/interface/ghotok/IMatchedUsers";
import { IPublicUserProfile } from "@/components/interface/ghotok/IPublicUserProfile";
import { IUserChats } from "@/components/interface/ghotok/IUsersChats";
import {
  IGhotokUserConversationForChat,
  IGhotokUsersForChat,
} from "@/components/interface/ghotok/IUsersForChat";
import { PaginatedResponse } from "@/components/interface/IUserConversation";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";

// Get all brides
export async function getAllGhotokBrides(
  page: number,
  limit: number
): Promise<PaginatedResponse<IGhotokUser[]>> {
  const response = await api.get<
    AxiosResponse<PaginatedResponse<IGhotokUser[]>>
  >(`/app/ghotok/users/bride?page=${page}&limit=${limit}`);
  return response.data.data;
}

// Get all grooms
export async function getAllGhotokGrooms(
  page: number,
  limit: number
): Promise<PaginatedResponse<IGhotokUser[]>> {
  const response = await api.get<
    AxiosResponse<PaginatedResponse<IGhotokUser[]>>
  >(`/app/ghotok/users/groom?page=${page}&limit=${limit}`);
  return response.data.data;
}

// Get home brides
export async function getGhotokHomeBrides(
  page: number,
  limit: number
): Promise<PaginatedResponse<IGhotokUser[]>> {
  const response = await api.get<
    AxiosResponse<PaginatedResponse<IGhotokUser[]>>
  >(`/app/ghotok/home/brides?page=${page}&limit=${limit}`);
  return response.data.data;
}

// Get home grooms
export async function getGhotokHomeGrooms(
  page: number,
  limit: number
): Promise<PaginatedResponse<IGhotokUser[]>> {
  const response = await api.get<
    AxiosResponse<PaginatedResponse<IGhotokUser[]>>
  >(`/app/ghotok/home/grooms?page=${page}&limit=${limit}`);
  return response.data.data;
}

// Send connection request
export async function ghotokSendConnectionRequest(
  senderId: string,
  receiverId: string
): Promise<any> {
  const response = await api.post<AxiosResponse<any>>(
    "/app/ghotok/connection-request/send",
    { senderId, receiverId }
  );
  return response.data;
}

// Get Public user profile by user id
export async function getPublicUserProfile(
  userId: string
): Promise<IPublicUserProfile> {
  const response = await api.get<AxiosResponse<IPublicUserProfile>>(
    `/app/ghotok/users/public/${userId}`
  );
  return response.data.data;
}

// Get ghotok user profile status images already saved by user id
export async function getGhotokAlreadySavedUserData(
  userId: string
): Promise<IGhotokUserStatus> {
  const response = await api.get<AxiosResponse<IGhotokUserStatus>>(
    `/app/ghotok/users/${userId}/status-images`
  );
  return response.data.data;
}

// Get ghotok user profile
export async function getGhotokUserProfileById(
  userId: string
): Promise<IGhotokUserProfile> {
  const response = await api.get<AxiosResponse<IGhotokUserProfile>>(
    `/app/ghotok/users/${userId}/view`
  );

  return response.data.data;
}

// Get ghotok user profile for edit
export async function loadGhotokUserProfileForEdit(
  userId: string
): Promise<IGhotokUserProfileEdit> {
  const response = await api.get<AxiosResponse<IGhotokUserProfileEdit>>(
    `/app/ghotok/users/${userId}/load`
  );

  return response.data.data;
}

// Get all ghotok user connection request
export async function getAllGhotokUserConnectionRequest(): Promise<
  IConnectionRequest[]
> {
  const response = await api.get<AxiosResponse<IConnectionRequest[]>>(
    "/app/ghotok/users/request/connections"
  );
  return response.data.data;
}

// Get all ghotok user conversations
// export async function getAllGhotokConversations(): Promise<IUserChats[]> {
//   const response = await api.get<AxiosResponse<IUserChats[]>>(
//     "/app/ghotok/users/conversations"
//   );
//   return response.data.data;
// }

// Get all ghotok user conversations details
// export async function getGhotokUserConversationsDetails(
//   convId: string
// ): Promise<IGhotokUserConversation> {
//   const response = await api.get<AxiosResponse<IGhotokUserConversation>>(
//     `/app/ghotok/users/conversations/${convId}`
//   );
//   return response.data.data;
// }

// Get all matching user for ghotok
export async function getAllMatchingUserForGhotok(): Promise<
  IGhotokSaConversations[]
> {
  const response = await api.get<AxiosResponse<IGhotokSaConversations[]>>(
    "/app/ghotok/matching/users/conversations"
  );
  return response.data.data;
}

export interface IMatchingPaymentRequest {
  price: number;
  content: string;
  paymentStatus: string;
  userId: string;
}

// Get matching payment request by message id
export async function getMatchingPaymentRequestByMessageId(
  messageId: string
): Promise<IMatchingPaymentRequest> {
  const response = await api.get<AxiosResponse<IMatchingPaymentRequest>>(
    `/app/ghotok/matching/payment/request/${messageId}`
  );

  return response.data.data;
}

export interface IMatchingPayment {
  id: string;
  amount: number;
  screenShotUrl: string;
  paymentName: string;
  status: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

// Get matching payment details by message id
export async function getMatchingPaymentDetailsByMessageId(
  messageId: string
): Promise<IMatchingPayment> {
  const response = await api.get<AxiosResponse<IMatchingPayment>>(
    `/app/ghotok/matching/payment/bymessageid/${messageId}`
  );

  return response.data.data;
}

// Get all matched users for chat with ghotok
export async function getAllMatchedUserForGhotok(): Promise<IMatchedUsers[]> {
  const response = await api.get<AxiosResponse<IMatchedUsers[]>>(
    "/app/ghotok/matched/users"
  );

  return response.data.data;
}

// Get all own brides for chat with ghotok
export async function getAllGhotokBridesForChat(
  page: number,
  limit: number
): Promise<PaginatedResponse<IGhotokUsersForChat[]>> {
  const response = await api.get<
    AxiosResponse<PaginatedResponse<IGhotokUsersForChat[]>>
  >(`/app/ghotok/chat/brides?page=${page}&limit=${limit}`);
  return response.data.data;
}

// Get all brides for chat with ghotok
export async function getAllConversationByBrideForChat(
  brideId: string,
  page: number,
  limit: number
): Promise<PaginatedResponse<IGhotokUserConversationForChat[]>> {
  const response = await api.get<
    AxiosResponse<PaginatedResponse<IGhotokUserConversationForChat[]>>
  >(
    `/app/ghotok/chat/brides/conversations/${brideId}?page=${page}&limit=${limit}`
  );
  return response.data.data;
}

// Get all own grooms for chat with ghotok
export async function getAllGhotokGroomsForChat(
  page: number,
  limit: number
): Promise<PaginatedResponse<IGhotokUsersForChat[]>> {
  const response = await api.get<
    AxiosResponse<PaginatedResponse<IGhotokUsersForChat[]>>
  >(`/app/ghotok/chat/grooms?page=${page}&limit=${limit}`);
  return response.data.data;
}

// Get all conversations of a groom for chat with ghotok
export async function getAllConversationByGroomForChat(
  groomId: string,
  page: number,
  limit: number
): Promise<PaginatedResponse<IGhotokUserConversationForChat[]>> {
  const response = await api.get<
    AxiosResponse<PaginatedResponse<IGhotokUserConversationForChat[]>>
  >(
    `/app/ghotok/chat/grooms/conversations/${groomId}?page=${page}&limit=${limit}`
  );
  return response.data.data;
}
