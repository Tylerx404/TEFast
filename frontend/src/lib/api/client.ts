import { appConfig } from "@/lib/config";
import type {
  ApiEnvelope,
  ApiFieldError,
  ApiMeta,
  ApiSuccess,
  PaginatedResponse,
} from "@/types/api";

type Primitive = string | number | boolean | null | undefined;
type QueryValue = Primitive | Primitive[];

export class ApiRequestError extends Error {
  status: number;
  errors: ApiFieldError[];

  constructor(message: string, status: number, errors: ApiFieldError[] = []) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.errors = errors;
  }
}

export type ApiFetchOptions = {
  baseUrl?: string;
  token?: string | null;
};

function resolveUrl(path: string, baseUrl: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;

  return `${normalizedBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function isApiSuccess<T>(payload: ApiEnvelope<T>): payload is ApiSuccess<T> {
  return payload.success;
}

export function buildQueryString(
  params: Record<string, QueryValue>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === null || item === undefined || item === "") {
          continue;
        }

        searchParams.append(key, String(item));
      }

      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function parseEnvelope<T>(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    if (!response.ok) {
      throw new ApiRequestError("Unexpected response from server", response.status);
    }

    return {
      data: null as T,
      message: response.statusText,
      meta: null,
    };
  }

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok) {
    const errors = isApiSuccess(payload) ? [] : (payload.errors ?? []);

    throw new ApiRequestError(
      payload.message || "Request failed",
      response.status,
      errors,
    );
  }

  if (!isApiSuccess(payload)) {
    throw new ApiRequestError(
      payload.message || "Request failed",
      response.status,
      payload.errors ?? [],
    );
  }

  return {
    data: payload.data,
    message: payload.message,
    meta: payload.meta as ApiMeta | null,
  } satisfies PaginatedResponse<T>;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: ApiFetchOptions = {},
) {
  const headers = new Headers(init.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const hasBody =
    init.body !== undefined &&
    init.body !== null &&
    !(init.body instanceof FormData);

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(resolveUrl(path, options.baseUrl ?? appConfig.apiBaseUrl), {
    ...init,
    headers,
  });

  return parseEnvelope<T>(response);
}

export async function proxyApiFetch<T>(path: string, init: RequestInit = {}) {
  return apiFetch<T>(path, init, {
    baseUrl: "",
  });
}
