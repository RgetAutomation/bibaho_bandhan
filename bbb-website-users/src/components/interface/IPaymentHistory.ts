export interface IPaymentHistory {
  id: string;
  status: string;
  createdAt: Date;
  paymentType: string;
  planTitle: string;
  planPrice: string;
}
