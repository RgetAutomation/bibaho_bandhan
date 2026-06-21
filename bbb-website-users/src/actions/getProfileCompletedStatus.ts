import { AxiosResponse } from "@/components/interface/AxiosResponse";
import api from "@/lib/axiosInstance";

export async function fetchProfileCompletionStatus(): Promise<boolean> {
  const response = await api.get<AxiosResponse<boolean>>(
    "/users/profile/complete/status",
    { withCredentials: true }
  );
  return response.data.data;
}
