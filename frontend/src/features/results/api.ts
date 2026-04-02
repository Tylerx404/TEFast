import { buildQueryString } from "@/lib/api/client";
import { safeServerApiFetch } from "@/lib/api/server";
import type { ExamResultDetail, ExamResultSummary } from "@/types/domain";
import type { ResultFilters } from "@/types/forms";

export async function getMyResults(filters: ResultFilters = {}) {
  return safeServerApiFetch<ExamResultSummary[]>(
    `/exam-results/my${buildQueryString(filters)}`,
    undefined,
    { auth: true },
  );
}

export async function getResult(resultId: string) {
  return safeServerApiFetch<ExamResultDetail>(`/exam-results/${resultId}`, undefined, {
    auth: true,
  });
}
