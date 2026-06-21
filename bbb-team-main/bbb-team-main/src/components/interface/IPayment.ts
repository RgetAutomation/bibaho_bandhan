export interface IPayments {
  id: string;
  status: string;
  screenShotUrl: string;
  createdAt: Date;
  user: IPaymentUser;
}

export interface IPaymentsWithPrice extends IPayments {
  plan: {
    price: string;
  };
}
export interface IPaymentUser {
  id: string;
  publicId: string;
  title: string;
  lastName: string;
  avatar: string;
  type: string;
  gender: string;
}

export interface IPaymentPlan {
  id: string;
  title: string;
  price: string;
  duration: string;
  connection: string;
}

export interface IPaymentFullDetails extends IPayments {
  paymentDate?: Date;
  amount?: string;
  feedback?: string;
  upiId?: string;
  plan?: IPaymentPlan;
  paymentName?: string;
}
