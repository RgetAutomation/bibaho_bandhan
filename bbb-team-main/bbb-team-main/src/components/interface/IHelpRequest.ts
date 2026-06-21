export interface IHelpRequest {
  id: string;
  name: string;
  phone: string;
  reason: string;
  message: string | null;
  feedback: string | null;
  status: string;
  createdAt: Date;
  hasUnread?: boolean;
  isNew?: boolean;
  isReopened?: boolean;
  latestMessageId?: string | null;
}

export interface IHelpRequestSingle {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  reason: string;
  message: string | null;
  status: string;
  adminNote: string | null;
  feedback: string | null;
  isReopened?: boolean;
  createdAt: Date;
}
