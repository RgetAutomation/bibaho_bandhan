export interface IPayments {
  id: string;
  plan: {
    price: string;
  };
  screenShotUrl: string;
  status: string;
  paymentName: string | null;
  feedback: string | null;
  createdAt: Date | null;
}
export interface IPaymentUser {
  id: string;
  title: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  phone: string;
  avatar: string | null;
  gender: string;
}

export interface IPaymentTeam {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  avatar: string | null;
}

export interface IMatchingPayments {
  id: string;
  amount: number;
  screenShotUrl: string | null;
  status: string;
  feedback: string | null;
  user: IPaymentUser;
  createdAt: Date;
  paymentName: string | null;
}

export interface IPaymentFullUser extends IPaymentUser {
  email: string | null;
  planExpiryDate: Date | null;
  blocked: boolean;
}

// For Expanded Payment with User Details

export interface ISubscribedPayments extends IPayments {
  user: IPaymentUser;
  team: IPaymentTeam | null;
}

export interface IMatchingPaymentsWithGender extends IMatchingPayments {
  user: IPaymentUser & {
    gender: string;
  };
}

export interface IDuePaymentsFullUser extends IPayments {
  user: IPaymentFullUser;
}

export interface IFullPaymentAndUser extends IPaymentFullUser {
  payments: IPayments[];
}

export interface ISingplePaymentDetails extends IPayments {
  user: IPaymentUser & { gender: string };
}

export interface ISubscribedPaymentsWithPlan {
  id: string;
  plan: {
    title: string;
    price: string;
    duration: string;
  };
  screenShotUrl: string;
  status: string;
  paymentName: string | null;
  feedback: string | null;
  createdAt: Date | null;
  user: IPaymentUser;
}
