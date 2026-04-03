import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getClearCookieDescriptors } from "@/lib/auth/cookies";
import { authConfig, appConfig } from "@/lib/config";

type RouteContext = {
  params: Promise<{
    segments: string[];
  }>;
};

async function forwardRequest(request: Request, context: RouteContext) {
  const { segments } = await context.params;
  const cookieStore = await cookies();
  const token = cookieStore.get(authConfig.accessTokenCookie)?.value;
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(
    `/${segments.join("/")}${incomingUrl.search}`,
    appConfig.apiBaseUrl,
  );
  const headers = new Headers(request.headers);

  headers.set("Accept", "application/json");
  headers.delete("host");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body: BodyInit | undefined;
  const method = request.method.toUpperCase();

  if (method !== "GET" && method !== "HEAD") {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      headers.delete("content-type");
      body = await request.formData();
    } else if (contentType.includes("application/json")) {
      body = JSON.stringify(await request.json());
      headers.set("Content-Type", "application/json");
    } else {
      body = await request.text();
    }
  }

  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
  });

  const nextResponse = new NextResponse(response.body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  });

  if (response.status === 401) {
    for (const cookie of getClearCookieDescriptors()) {
      nextResponse.cookies.set(cookie);
    }
  }

  return nextResponse;
}

export async function GET(request: Request, context: RouteContext) {
  return forwardRequest(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return forwardRequest(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return forwardRequest(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return forwardRequest(request, context);
}
