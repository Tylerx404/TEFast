import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { apiFetch, ApiRequestError } from "@/lib/api/client";
import { getClearCookieDescriptors } from "@/lib/auth/cookies";
import { authConfig, appConfig } from "@/lib/config";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authConfig.accessTokenCookie)?.value;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  try {
    const response = await apiFetch("/auth/me", undefined, {
      baseUrl: appConfig.apiBaseUrl,
      token,
    });

    return NextResponse.json({
      success: true,
      message: response.message,
      data: response.data,
      meta: response.meta,
    });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      const response = NextResponse.json(
        {
          success: false,
          message: error.message,
          errors: error.errors,
        },
        { status: error.status },
      );

      if (error.status === 401) {
        for (const cookie of getClearCookieDescriptors()) {
          response.cookies.set(cookie);
        }
      }

      return response;
    }

    return NextResponse.json(
      {
        success: false,
        message: "Session proxy failed",
      },
      { status: 500 },
    );
  }
}
