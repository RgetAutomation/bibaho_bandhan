import { AxiosResponse } from "@/components/interface/AxiosResponse";
import { IServerResponse } from "./../components/interface/IServerResponse";
import api from "@/lib/axiosInstance";
import { isAxiosError } from "axios";
import { IConnectionRequest } from "@/components/interface/IConnectionRequest";

export async function sendConnectionRequest(
  receiverId: string
): Promise<IServerResponse<null>> {
  try {
    const response = await api.post<AxiosResponse<null>>(
      "/users/connection/send",
      { receiverId }
    );
    return {
      success: response.data.success,
      message: response.data.message,
      data: null,
    };
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to send connection request"
      : "Something went wrong";
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
}

export async function acceptConnectionRequest(
  requestId: string
): Promise<IServerResponse<null>> {
  try {
    const response = await api.post<AxiosResponse<null>>(
      "/users/connection/accept",
      { requestId }
    );
    return {
      success: response.data.success,
      message: response.data.message,
      data: null,
    };
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to accept connection request"
      : "Something went wrong";
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
}

export async function deleteConnectionRequest(
  requestId: string
): Promise<IServerResponse<null>> {
  try {
    const response = await api.post<AxiosResponse<null>>(
      "/users/connection/delete",
      { requestId }
    );
    return {
      success: response.data.success,
      message: response.data.message,
      data: null,
    };
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to accept connection request"
      : "Something went wrong";
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
}

export async function rejectConnectionRequest(
  requestId: string
): Promise<IServerResponse<null>> {
  try {
    const response = await api.post<AxiosResponse<null>>(
      "/users/connection/reject",
      { requestId }
    );
    return {
      success: response.data.success,
      message: response.data.message,
      data: null,
    };
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to reject connection request"
      : "Something went wrong";
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
}

export async function getAllInterestReceived() {
  const response = await api.get<AxiosResponse<IConnectionRequest[]>>(
    "/users/connection/interests/received",
    {
      headers: {
        "cache-control": "no-cache",
      },
    }
  );
  return response.data.data;
}

export async function getAllInterestSent() {
  const response = await api.get<AxiosResponse<IConnectionRequest[]>>(
    "/users/connection/interests/sent",
    {
      headers: {
        "cache-control": "no-cache",
      },
    }
  );
  return response.data.data;
}

export async function blockUser(
  userId: string
): Promise<IServerResponse<null>> {
  try {
    const response = await api.get<AxiosResponse<null>>(
      `/users/${userId}/block`
    );
    return {
      success: response.data.success,
      message: response.data.message,
      data: null,
    };
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to block user"
      : "Something went wrong";
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
}

export async function unblockUser(
  userId: string
): Promise<IServerResponse<null>> {
  try {
    const response = await api.delete<AxiosResponse<null>>(
      `/users/${userId}/block`,
      {
        headers: {
          "cache-control": "no-cache",
        },
      }
    );
    return {
      success: response.data.success,
      message: response.data.message,
      data: null,
    };
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || "Failed to unblock user"
      : "Something went wrong";
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
}
