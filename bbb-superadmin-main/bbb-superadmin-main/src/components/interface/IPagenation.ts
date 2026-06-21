export interface IPaginationParams {
  page?: number;
  limit?: number;
}

export interface IPaginatedResult<T> {
  totalData: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  data: T;
}
