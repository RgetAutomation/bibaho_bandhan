export interface IModerationMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: IModerationMessageUser;
  receiver: IModerationMessageUser;
  conversation: {
    id: string;
    convId: string;
    starConversation: boolean;
  };
}

export interface IModerationMessageUser {
  id: string;
  title: string;
  lastName: string;
  gender: string;
  avatar: string;
  isGhotokOwned: boolean;
}
