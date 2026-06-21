export interface AxiosResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export interface ApiDataProps<T> {
  data: T;
  error: string | null;
}
