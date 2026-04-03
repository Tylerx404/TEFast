import { buildQueryString, proxyApiFetch } from "@/lib/api/client";
import { safeServerApiFetch } from "@/lib/api/server";
import type { EnrollmentDetail, EnrollmentItem } from "@/types/domain";
import type { EnrollmentFilters } from "@/types/forms";

export async function getMyEnrollments(filters: EnrollmentFilters = {}) {
  return safeServerApiFetch<EnrollmentItem[]>(
    `/enrollments/my${buildQueryString(filters)}`,
    undefined,
    { auth: true },
  );
}

export async function getEnrollment(enrollmentId: string) {
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
