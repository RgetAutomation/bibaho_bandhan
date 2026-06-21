export interface IApiRespone<T> {
  success: boolean;
  data: T;
  message: string | null;
}
