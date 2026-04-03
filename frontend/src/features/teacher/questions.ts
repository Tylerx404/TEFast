import { proxyApiFetch } from "@/lib/api/client";
import { safeServerApiFetch } from "@/lib/api/server";
import type {
  QuestionCreateInput,
  QuestionDetail,
  QuestionItem,
  QuestionUpdateInput,
} from "@/types/domain";

export async function getTeacherQuestions(examId: string) {
  return safeServerApiFetch<QuestionItem[]>(
    `/exams/${examId}/questions`,
    undefined,
    { auth: true },
  );
}

export async function getTeacherQuestion(questionId: string) {
  return safeServerApiFetch<QuestionDetail>(
    `/questions/${questionId}`,
    undefined,
    { auth: true },
  );
}

export async function createTeacherQuestion(
  examId: string,
  payload: QuestionCreateInput,
) {
  return proxyApiFetch(`/api/proxy/exams/${examId}/questions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTeacherQuestion(
  questionId: string,
  payload: QuestionUpdateInput,
) {
  return proxyApiFetch(`/api/proxy/questions/${questionId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTeacherQuestion(questionId: string) {
  return proxyApiFetch(`/api/proxy/questions/${questionId}`, {
    method: "DELETE",
  });
}
