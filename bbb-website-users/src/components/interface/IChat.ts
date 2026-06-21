import { IMessage } from "./IMessage";

export interface IChat {
  id: string;
  messages: IMessage[];
  participants: IChatParticipant;
}

export interface IChatParticipant {
  id: string;
  title: string;
  lastName: string;
  avatar: string;
  isGhotokOwned: boolean;
}
