import { cookies } from "next/headers";

import { apiFetch, ApiRequestError } from "@/lib/api/client";
import { authConfig, appConfig } from "@/lib/config";

type ServerApiOptions = {
  auth?: boolean;
};

export async function serverApiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: ServerApiOptions = {},
) {
  const cookieStore = await cookies();
  const token = options.auth
    ? (cookieStore.get(authConfig.accessTokenCookie)?.value ?? null)
    : null;

  return apiFetch<T>(path, init, {
    baseUrl: appConfig.apiBaseUrl,
    token,
  });
}

export async function safeServerApiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: ServerApiOptions = {},
) {
  try {
    return await serverApiFetch<T>(path, init, options);
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return null;
    }

    throw error;
  }
}
