import {
  IReportedUser,
  IReportedUsers,
} from "@/components/interface/IReportedGroom";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";

// Get all reported grooms for admin
export async function getReportedGroom(): Promise<IReportedUsers[]> {
  const response = await api.get<AxiosResponse<IReportedUsers[]>>(
    "/app/admin/groom/reported"
  );
  return response.data.data;
}

// Get single reported user by user id for admin
export async function getSingleReportedGroom(
  userId: string
): Promise<IReportedUser> {
  const response = await api.get<AxiosResponse<IReportedUser>>(
    `/app/admin/groom/reported/${userId}`
  );
  return response.data.data;
}

// Get all reported Brides for moderator
export async function getReportedBrides(): Promise<IReportedUser[]> {
  const response = await api.get<AxiosResponse<IReportedUser[]>>(
    "/app/moderator/bride/reported"
  );
  return response.data.data;
}

// Get single reported bride by user id for moderator
export async function getSingleReportedBride(
  userId: string
): Promise<IReportedUser> {
  const response = await api.get<AxiosResponse<IReportedUser>>(
    `/app/moderator/bride/reported/${userId}`
  );
  return response.data.data;
}

// Get all reported users for ghotok
export async function getReportedGhotokUser(): Promise<IReportedUser[]> {
  const response = await api.get<AxiosResponse<IReportedUser[]>>(
    "/app/ghotok/user/reported"
  );
  return response.data.data;
}

// Get single reported users by user id for ghotok
export async function getSingleReportedGhotokUsers(
  userId: string
): Promise<IReportedUser> {
  const response = await api.get<AxiosResponse<IReportedUser>>(
    `/app/ghotok/user/reported/${userId}`
  );
  return response.data.data;
}
