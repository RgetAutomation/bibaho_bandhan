"use server";

import { AxiosResponse } from "@/components/interface/AxiosResponse";
import { IJoinGhotokRequest } from "@/components/interface/IJoinGhotok";
import { IServerResponse } from "@/components/interface/IServerResponse";
import api from "@/lib/axiosInstance";

export async function getGhotokRequestById(
  requestId: string
): Promise<IServerResponse<IJoinGhotokRequest | null>> {
  try {
    const respone = await api.get<AxiosResponse<IJoinGhotokRequest>>(
      `/app/ghotok/join/view/${requestId}`
    );

    const data = respone.data.data;

    return {
      success: respone.data.success,
      message: respone.data.message,
      data,
    } as IServerResponse<IJoinGhotokRequest>;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong",
      data: null,
    } as IServerResponse<IJoinGhotokRequest | null>;
  }
}
