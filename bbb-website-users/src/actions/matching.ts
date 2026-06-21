import { AxiosResponse } from "@/components/interface/AxiosResponse";
import api from "@/lib/axiosInstance";

export interface IMatchingPaymentRequest {
  price: number;
  content: string;
  paymentStatus: string;
  reportId: string;
}

export interface IMatchingPayment {
  id: string;
  amount: number;
  screenShotUrl: string;
  paymentName: string;
  status: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getMatchingPaymentRequestByMessageId(
  messageId: string,
): Promise<IMatchingPaymentRequest> {
  const response = await api.get<AxiosResponse<IMatchingPaymentRequest>>(
    `/users/payment/matching/request/${messageId}`,
  );

  return response.data.data;
}

// export async function getMatchingPaymentDetailsByPaymentId(
//   paymentId: string,
// ): Promise<IMatchingPayment> {
//   const response = await api.get<AxiosResponse<IMatchingPayment>>(
//     `/users/payment/matching/bypaymentid/${paymentId}`,
//   );

//   return response.data.data;
// }

export async function getMatchingPaymentDetailsByMessageId(
  messageId: string,
): Promise<IMatchingPayment> {
  const response = await api.get<AxiosResponse<IMatchingPayment>>(
    `/users/payment/matching/bymessageid/${messageId}`,
  );

  return response.data.data;
}
