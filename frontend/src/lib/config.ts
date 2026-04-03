export const appConfig = {
  name: "TEFast",
  description: "Learning hub for TOEIC and IELTS preparation.",
  apiBaseUrl:
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:3001",
} as const;

export const authConfig = {
  accessTokenCookie: "tefast_access_token",
  expiresAtCookie: "tefast_access_expires_at",
} as const;
