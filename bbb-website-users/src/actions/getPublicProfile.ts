import { AxiosResponse } from "@/components/interface/AxiosResponse";
import { IPublicProfile } from "@/components/interface/IPublicProfile";
import api from "@/lib/axiosInstance";

export async function getPublicProfile() {
  const response = await api.get<AxiosResponse<IPublicProfile[]>>(
    `/users/public/profiles`,
    { withCredentials: true }
  );
  return response.data.data;
}

export async function getAllPublicProfile(): Promise<IPublicProfile[]> {
  const response = await api.get<AxiosResponse<IPublicProfile[]>>(
    `/users/public/profiles/all`,
    { withCredentials: true }
  );
  return response.data.data;
}
