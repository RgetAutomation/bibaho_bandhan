export interface IConnectionRequest {
  id: string;
  createdAt: Date;
  sender: IConnectionRequestSenderUser;
  receiver: IConnectionRequestReceiverUser;
}

export interface IConnectionRequestSenderUser {
  id: string;
  title: string;
  lastName: string;
  avatar: string;
  gender: string;
  isGhotokOwned: boolean;
}

export interface IConnectionRequestReceiverUser {
  id: string;
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  avatar: string;
  gender: string;
  isGhotokOwned: boolean;
}
