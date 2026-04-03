export type ApiFieldError = {
  field?: string;
  message: string;
};

export type ApiMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  meta: ApiMeta | null;
};

export type ApiFailure = {
  success: false;
  message: string;
  errors?: ApiFieldError[];
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export type PaginatedResponse<T> = {
  data: T;
  meta: ApiMeta | null;
  message: string;
};
