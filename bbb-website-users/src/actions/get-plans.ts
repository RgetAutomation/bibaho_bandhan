import { AxiosResponse } from "@/components/interface/AxiosResponse";
import api from "@/lib/axiosInstance";

export interface Plans {
  id: string;
  title: string;
  price: string;
  connection: string;
  duration: string;
  discounts?: { id: string; percentage: number; isActive: boolean }[];
}

export async function getPlans(): Promise<Plans[]> {
  const response = await api.get<AxiosResponse<Plans[]>>(`/users/plans`);
  return response.data.data;
}

export async function getPlanById(id: string): Promise<Plans | null> {
  const response = await api.get<AxiosResponse<Plans>>(`/users/plans/${id}`);
  return response.data.data;
}
