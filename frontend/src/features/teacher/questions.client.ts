import { proxyApiFetch } from "@/lib/api/client";
import type { QuestionCreateInput, QuestionUpdateInput } from "@/types/domain";

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
