import {
  IPaymentFullDetails,
  IPaymentsWithPrice,
} from "@/components/interface/IPayment";
import { PaginatedResponse } from "@/components/interface/IUserConversation";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/types/AxiosResponse";

// Get All Payments
export async function getAllPayments(
  page: number = 1,
  limit: number = 10,
  sortBy?: string
): Promise<PaginatedResponse<IPaymentsWithPrice[]>> {
  const response = await api.get<
    AxiosResponse<PaginatedResponse<IPaymentsWithPrice[]>>
  >(`/app/admin/payments?page=${page}&limit=${limit}&sortBy=${sortBy}`);
  return response.data.data;
}

// Get payment details by payment id
export async function getPaymentDetailsById(
  paymentId: string
): Promise<IPaymentFullDetails> {
  const response = await api.get<AxiosResponse<IPaymentFullDetails>>(
    `/app/admin/payments/${paymentId}/view`
  );
  return response.data.data;
}
