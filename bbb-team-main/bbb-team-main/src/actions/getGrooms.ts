import { AxiosResponse } from "@/types/AxiosResponse";
import { Groom } from "@/types/groom";
import api from "@/lib/axiosInstance";

/**
 * Generic GET request with auth and standardized IApiRespone
 */
async function fetchWithAuth<T>(endpoint: string): Promise<T> {
  const response = await api.get<AxiosResponse<T>>(endpoint);
  return response.data.data;
}

// Specific functions
export const getFreeGrooms = () =>
  fetchWithAuth<Groom[]>("/app/admin/groom/free");
export const getPaidGrooms = () =>
  fetchWithAuth<Groom[]>("/app/admin/groom/paid");
export const getEndPlanGrooms = () =>
  fetchWithAuth<Groom[]>("/app/admin/groom/endplan");
export const getPaidMatchingGrooms = () =>
  fetchWithAuth<Groom[]>("/app/admin/groom/paidmatching");
export const getBlockedGrooms = () =>
  fetchWithAuth<Groom[]>("/app/admin/groom/blocked");
export const getReportedGrooms = () =>
  fetchWithAuth<Groom[]>("/app/admin/groom/reported");
