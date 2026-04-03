import { proxyApiFetch } from "@/lib/api/client";
import type { ExamResultReviewInput } from "@/types/domain";

export async function reviewTeacherResult(
  resultId: string,
  payload: ExamResultReviewInput,
) {
  return proxyApiFetch(`/api/proxy/exam-results/${resultId}/review`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
