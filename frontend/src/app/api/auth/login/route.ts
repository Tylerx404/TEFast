import { NextResponse } from "next/server";

import { apiFetch, ApiRequestError } from "@/lib/api/client";
import {
  getAuthCookieDescriptor,
  getClearCookieDescriptors,
  getExpiresAtCookieDescriptor,
} from "@/lib/auth/cookies";
import { appConfig } from "@/lib/config";

type LoginPayload = {
  user: Record<string, unknown>;
  accessToken: string;
  expiresIn: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await apiFetch<LoginPayload>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }, {
      baseUrl: appConfig.apiBaseUrl,
    });

    const nextResponse = NextResponse.json({
      success: true,
      message: response.message,
      data: response.data,
      meta: response.meta,
    }, {
      status: 200,
    });

    nextResponse.cookies.set(
      getAuthCookieDescriptor(response.data.accessToken, response.data.expiresIn),
    );
    nextResponse.cookies.set(
      getExpiresAtCookieDescriptor(response.data.expiresIn),
    );

    return nextResponse;
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

      for (const cookie of getClearCookieDescriptors()) {
        response.cookies.set(cookie);
      }

      return response;
    }

    return NextResponse.json(
      {
        success: false,
        message: "Login proxy failed",
      },
      { status: 500 },
    );
  }
}
