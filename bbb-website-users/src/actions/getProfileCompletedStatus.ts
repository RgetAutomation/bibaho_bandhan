import { AxiosResponse } from "@/components/interface/AxiosResponse";
import api from "@/lib/axiosInstance";

export async function fetchProfileCompletionStatus(): Promise<{ isProfileComplete: boolean; verificationStatus: string }> {
  const response = await api.get<AxiosResponse<{ isProfileComplete: boolean; verificationStatus: string }>>(
    "/users/profile/complete/status",
    { withCredentials: true }
  );
  return response.data.data;
}
