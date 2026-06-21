export interface IServerResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
