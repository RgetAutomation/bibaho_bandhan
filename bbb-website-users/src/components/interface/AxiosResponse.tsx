export interface AxiosResponse<T> {
  data: T;
  statusCode: number;
  message: string;
  success: boolean;
}

export type PaginationResponse<T> = AxiosResponse<{
  page: number;
  total: number;
  totalData: number;
  data: T[];
}>;

export interface ResponseData<T> {
  data: T;
  error: string;
}
