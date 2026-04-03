import { buildQueryString, proxyApiFetch } from "@/lib/api/client";
import type {
  ExamResultDetail,
  ExamResultReviewInput,
  TeacherExamResultItem,
} from "@/types/domain";

async function getSafeServerApiFetch() {
  const { safeServerApiFetch } = await import("@/lib/api/server");
  return safeServerApiFetch;
}

export async function getTeacherExamResults(
  examId: string,
  filters: Record<string, string | number | boolean> = {},
) {
  const safeServerApiFetch = await getSafeServerApiFetch();
  return safeServerApiFetch<TeacherExamResultItem[]>(
    `/exams/${examId}/results${buildQueryString(filters)}`,
    undefined,
    { auth: true },
  );
}

export async function getTeacherResult(resultId: string) {
  const safeServerApiFetch = await getSafeServerApiFetch();
  return safeServerApiFetch<ExamResultDetail>(
    `/exam-results/${resultId}`,
    undefined,
    { auth: true },
  );
}

export async function reviewTeacherResult(
  resultId: string,
  payload: ExamResultReviewInput,
) {
  return proxyApiFetch(`/api/proxy/exam-results/${resultId}/review`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
