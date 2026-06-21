import {
  IHelpRequest,
  IHelpRequestSingle,
} from "@/components/interface/IHelpRequest";
import {
  IPaginatedResult,
} from "@/components/interface/IPagenation";
import api from "@/components/utils/axiosInstance";
import { AxiosResponse } from "@/components/utils/AxiosResponse";

// Get all help requests
export async function getAllHelpRequests(
  page: number = 1,
  limit: number = 10
): Promise<IPaginatedResult<IHelpRequest[]>> {
  const response = await api.get<
    AxiosResponse<IPaginatedResult<IHelpRequest[]>>
  >(`/app/admin/request/help?page=${page}&limit=${limit}`);
  return response.data.data;
}

export async function getSingleHelpRequestById(
  requestId: string
): Promise<IHelpRequestSingle> {
  const response = await api.get<AxiosResponse<IHelpRequestSingle>>(
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
