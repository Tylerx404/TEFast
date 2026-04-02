import { buildQueryString, proxyApiFetch } from "@/lib/api/client";
import { safeServerApiFetch } from "@/lib/api/server";
import type {
  ExamResultDetail,
  ExamResultReviewInput,
  TeacherExamResultItem,
} from "@/types/domain";

export async function getTeacherExamResults(
  examId: string,
  filters: Record<string, string | number | boolean> = {},
) {
  return safeServerApiFetch<TeacherExamResultItem[]>(
    `/exams/${examId}/results${buildQueryString(filters)}`,
    undefined,
    { auth: true },
  );
}

export async function getTeacherResult(resultId: string) {
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
