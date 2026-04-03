import { NextResponse } from "next/server";

import { getClearCookieDescriptors } from "@/lib/auth/cookies";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out",
    data: null,
    meta: null,
  });

  for (const cookie of getClearCookieDescriptors()) {
    response.cookies.set(cookie);
  }

  return response;
}
