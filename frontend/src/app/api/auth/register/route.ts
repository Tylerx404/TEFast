import { NextResponse } from "next/server";

import { apiFetch, ApiRequestError } from "@/lib/api/client";
import {
  getAuthCookieDescriptor,
  getClearCookieDescriptors,
  getExpiresAtCookieDescriptor,
} from "@/lib/auth/cookies";
import { appConfig } from "@/lib/config";

type RegisterPayload = {
  user: Record<string, unknown>;
  accessToken: string;
  expiresIn: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await apiFetch<RegisterPayload>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }, {
      baseUrl: appConfig.apiBaseUrl,
    });

    const nextResponse = NextResponse.json(response, {
      status: 201,
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
        message: "Register proxy failed",
      },
      { status: 500 },
    );
  }
}
