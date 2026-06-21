import { AxiosResponse } from "@/components/interface/AxiosResponse";
import { IPaymentDetails } from "@/components/interface/IPaymentDetails";
import { IPaymentHistory } from "@/components/interface/IPaymentHistory";
import api from "@/lib/axiosInstance";

export async function getPaymentStatusById(
  paymentId: string
): Promise<IPaymentDetails> {
  const response = await api.get<AxiosResponse<IPaymentDetails>>(
    `/users/payment/subscription/${paymentId}/view`
  );

  return response.data.data;
}

export async function getAllPayments() {
  const res = await api.get<AxiosResponse<IPaymentHistory[]>>(
    "/users/payments/subscription"
  );
  return res.data.data;
}

export async function getMySubscriptions() {
  const res = await api.get<AxiosResponse<any[]>>(
    "/users/me/subscriptions"
  );
  return res.data.data;
}
