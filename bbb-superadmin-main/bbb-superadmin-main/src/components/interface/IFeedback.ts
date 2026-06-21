export interface IFeedback {
  id: string;
  rating: string;
  name: string;
  phone: string;
  email: string | null;
  feedback: string;
  createdAt: Date;
}
