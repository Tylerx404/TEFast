import { proxyApiFetch } from "@/lib/api/client";

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
