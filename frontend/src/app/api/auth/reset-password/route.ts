import { NextResponse } from "next/server";

import { apiFetch, ApiRequestError } from "@/lib/api/client";
import { appConfig } from "@/lib/config";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
    }, {
      baseUrl: appConfig.apiBaseUrl,
    });

    return NextResponse.json({
      success: true,
      message: response.message,
      data: response.data,
      meta: response.meta,
    });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          errors: error.errors,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Reset password proxy failed",
      },
      { status: 500 },
    );
  }
}
