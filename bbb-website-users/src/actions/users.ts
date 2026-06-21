import { AxiosResponse } from "@/components/interface/AxiosResponse";
import { IBlockedUser } from "@/components/interface/IBlockedUser";
import { IHelpCenterTeam } from "@/components/interface/IHelpCenterTeam";
import { IProfileImageData } from "@/components/interface/IProfileImages";
import {
  IReportedProfile,
  IReportedUsers,
} from "@/components/interface/IReportedUsers";
import { UserProfileSelf } from "@/components/interface/ISelfProfile";
import api from "@/lib/axiosInstance";

export async function getReportedUsers(): Promise<IReportedUsers[]> {
  const response = await api.get<AxiosResponse<IReportedUsers[]>>(
    "/users/profile/report/all",
    {
      withCredentials: true,
    },
  );
  return response.data.data;
}

export async function getSingleReportedUsers(
  reportedId: string,
): Promise<IReportedProfile> {
  const response = await api.get<AxiosResponse<IReportedProfile>>(
    `/users/profile/report/${reportedId}`,
    {
      withCredentials: true,
    },
  );
  return response.data.data;
}

export async function getBlockedUsers(): Promise<IBlockedUser[]> {
  const response = await api.get<AxiosResponse<IBlockedUser[]>>(
    "/users/blocked",
    {
      withCredentials: true,
    },
  );
  return response.data.data;
}

export async function fetchSelfProfileDetails(): Promise<UserProfileSelf> {
  const response = await api.get<AxiosResponse<UserProfileSelf>>(
    "/users/profile/self",
    {
      withCredentials: true,
    },
  );
  return response.data.data;
}

export async function fetchProfileImages(): Promise<IProfileImageData> {
  const response = await api.get<AxiosResponse<IProfileImageData>>(
    "/users/profile/update/images",
    { withCredentials: true },
  );
  return response.data.data;
}

export async function getHelpCenterTeam(): Promise<IHelpCenterTeam[]> {
  const response = await api.get<AxiosResponse<IHelpCenterTeam[]>>(
    "/users/helpcenter/team",
    { withCredentials: true },
  );
  return response.data.data;
}

export interface IHelpTicket {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "PENDING" | "INPROGRESS" | "RESOLVED" | "CLOSED";
  reason: string;
  message: string;
  adminNote: string | null;
  feedback: string | null;
  resolvedAt: string | null;
  isReopened: boolean;
  createdAt: string;
}

export async function getHelpRequestById(
  requestId: string,
): Promise<IHelpTicket> {
  const response = await api.get<AxiosResponse<IHelpTicket>>(
    `/other/help/request/${requestId}`,
    { withCredentials: true },
  );
  return response.data.data;
}

export async function sendFeedback(ticketId: string, feedback: string) {
  const res = await api.post("/other/help/request/feedback", {
    requestId: ticketId,
    feedback,
  });

  return res.data;
}

export async function reopenTicket(ticketId: string) {
  const res = await api.patch(`/other/help/request/${ticketId}/reopen`);
  return res.data;
}

export interface IHelpRequestMessage {
  id: string;
  helpRequestId: string;
  senderType: "GUEST" | "TEAM";
  senderId: string | null;
  content: string;
  createdAt: string;
  teamSender: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  } | null;
}

export async function getHelpRequestMessages(
  requestId: string,
): Promise<IHelpRequestMessage[]> {
  const response = await api.get<AxiosResponse<IHelpRequestMessage[]>>(
    `/other/help/request/${requestId}/messages`,
  );
  return response.data.data;
}

export async function sendHelpRequestMessage(
  requestId: string,
  content: string,
) {
  const res = await api.post(`/other/help/request/${requestId}/messages`, {
    content,
  });
  return res.data;
}
