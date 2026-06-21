import { AxiosResponse } from "@/components/interface/AxiosResponse";
import { IChat } from "@/components/interface/IChat";
import { IConversation } from "@/components/interface/IConversation";
import api from "@/lib/axiosInstance";

export async function getConversations() {
  const response = await api.get<AxiosResponse<IConversation[]>>(
    "/users/conversations"
  );
  return response.data.data;
}

export async function getConversationById(id: string) {
  const response = await api.get<AxiosResponse<IChat>>(
    `/users/conversations/${id}/messages`
  );
  return response.data.data;
}
