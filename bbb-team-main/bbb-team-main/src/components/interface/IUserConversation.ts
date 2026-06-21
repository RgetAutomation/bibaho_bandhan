import { Gender } from "@/types/groom";

export interface IUserConversation {
  id: string;
  convId: string;
  participants: IUserParticipant[];
}

export interface IUserParticipant {
  id: string;
  title: string;
  lastName: string;
  gender: Gender;
  avatar?: string; // Optional avatar URL
}

// export interface Message {
//   id: string;
//   conversationId: string;
//   senderId: string;
//   body: string;
//   type: MessageType;
//   createdAt: string;
//   updatedAt?: string;
//   status?: MessageStatus;
//   replyToId?: string;
//   replyTo?: Message;
// }

export interface PaginatedResponse<T> {
  totalData: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  data: T;
}
