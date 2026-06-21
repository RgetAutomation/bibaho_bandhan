import { AxiosResponse } from "@/components/interface/AxiosResponse";
import { IGhotok } from "@/components/interface/IGhotok";
import api from "@/lib/axiosInstance";

export async function getGhotokProfileDetailsById(
  profileId: string
): Promise<IGhotok> {
  const response = await api.get<AxiosResponse<IGhotok>>(
    `/users/ghotok/profile/${profileId}`
  );
  return response.data.data;
}
