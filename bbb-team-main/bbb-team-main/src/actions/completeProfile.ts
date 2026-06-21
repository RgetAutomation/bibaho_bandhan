import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";

export interface IProfileRequestStatus {
  avatar: string;
  identificationProof: string;
  dob: string;
  addressLine1: string;
  addressLine2: string;
  policeStation: string;
  postOffice: string;
  dist: string;
  state: string;
  pinCode: string;
  status: string;
  createdAt: string;
  team: {
    firstName: string;
    middleName: string;
    lastName: string;
  };
}

// get complete profile request status details by profile id
export async function getCompleteProfileRequestStatus(
  profileId: string
): Promise<IProfileRequestStatus> {
  const response = await api.get<AxiosResponse<IProfileRequestStatus>>(
    `/auth/system/profile/update/request/${profileId}/details`
  );
  return response.data.data;
}
