export interface IPaymentDetails {
  id: string;
  screenShotUrl: string;
  status: string;
  createdAt: number;
  paymentName: string;
  plan: {
    id: string;
    title: string;
    price: number;
    duration: string;
    connections: string;
  };
}
