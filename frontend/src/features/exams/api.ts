import { buildQueryString } from "@/lib/api/client";
import { safeServerApiFetch } from "@/lib/api/server";
import type { ExamDetail, ExamResultSummary, QuestionItem } from "@/types/domain";

export async function getExam(examId: string) {
  return safeServerApiFetch<ExamDetail>(`/exams/${examId}`);
}

export async function getExamQuestions(examId: string) {
  return safeServerApiFetch<QuestionItem[]>(
    `/exams/${examId}/questions`,
    undefined,
    { auth: true },
  );
}

export async function getExamResults(examId: string) {
  return safeServerApiFetch<ExamResultSummary[]>(
    `/exams/${examId}/results${buildQueryString({ page: 1, limit: 20 })}`,
    undefined,
    { auth: true },
  );
}
