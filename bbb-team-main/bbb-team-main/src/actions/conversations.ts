import { IUsersConversation } from "@/components/interface/IUsersConversation";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";

// Get user conversations by conversation id
export async function getUserConversations(
  convId: string
): Promise<IUsersConversation> {
  const response = await api.get<AxiosResponse<IUsersConversation>>(
    `/conversations/users/conversations/${convId}`
  );
  return response.data.data;
}
