import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import { authConfig } from "@/lib/config";

const baseCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export function getAuthCookieDescriptor(token: string, expiresIn: number) {
  return {
    name: authConfig.accessTokenCookie,
    value: token,
    ...baseCookieOptions,
    maxAge: expiresIn,
  } satisfies ResponseCookie;
}

export function getExpiresAtCookieDescriptor(expiresIn: number) {
  return {
    name: authConfig.expiresAtCookie,
    value: String(Date.now() + expiresIn * 1000),
    ...baseCookieOptions,
    maxAge: expiresIn,
  } satisfies ResponseCookie;
}

export function getClearCookieDescriptors() {
  return [
    {
      name: authConfig.accessTokenCookie,
      value: "",
      ...baseCookieOptions,
      maxAge: 0,
    },
    {
      name: authConfig.expiresAtCookie,
      value: "",
      ...baseCookieOptions,
      maxAge: 0,
    },
  ] satisfies ResponseCookie[];
}
