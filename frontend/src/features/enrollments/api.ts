import { buildQueryString, proxyApiFetch } from "@/lib/api/client";
import type { EnrollmentDetail, EnrollmentItem } from "@/types/domain";
import type { EnrollmentFilters } from "@/types/forms";

async function getSafeServerApiFetch() {
  const { safeServerApiFetch } = await import("@/lib/api/server");
  return safeServerApiFetch;
}

export async function getMyEnrollments(filters: EnrollmentFilters = {}) {
  const safeServerApiFetch = await getSafeServerApiFetch();
  return safeServerApiFetch<EnrollmentItem[]>(
    `/enrollments/my${buildQueryString(filters)}`,
    undefined,
    { auth: true },
  );
}

export async function getEnrollment(enrollmentId: string) {
  const safeServerApiFetch = await getSafeServerApiFetch();
  return safeServerApiFetch<EnrollmentDetail>(
    `/enrollments/${enrollmentId}`,
    undefined,
    { auth: true },
  );
}

export async function updateEnrollmentProgress(
  enrollmentId: string,
  payload: {
    progressPercent: number;
    lastLessonId: string;
    status: "ACTIVE" | "COMPLETED";
  },
) {
  return proxyApiFetch(`/api/proxy/enrollments/${enrollmentId}/progress`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
