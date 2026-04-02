import { cache } from "react";

import { redirect } from "next/navigation";

import { safeServerApiFetch } from "@/lib/api/server";
import type { SessionUser } from "@/types/domain";

export const getSession = cache(async () => {
  const response = await safeServerApiFetch<SessionUser>("/auth/me", undefined, {
    auth: true,
  });

  return response?.data ?? null;
});

export async function requireSession(redirectTo: string) {
  const session = await getSession();

  if (!session) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return session;
}

export function isTeacherRole(
  user: Pick<SessionUser, "role"> | null | undefined,
) {
  return user?.role === "TEACHER" || user?.role === "ADMIN";
}

export async function requireTeacherSession(redirectTo: string) {
  const session = await requireSession(redirectTo);

  if (!isTeacherRole(session)) {
    redirect("/my-courses");
  }

  return session;
}
