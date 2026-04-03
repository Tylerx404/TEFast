import { proxyApiFetch } from "@/lib/api/client";
import type { ExamCreateInput, ExamUpdateInput } from "@/types/domain";

export async function createTeacherExam(payload: ExamCreateInput) {
  return proxyApiFetch<{ id: string }>(`/api/proxy/exams`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTeacherExam(
  examId: string,
  payload: ExamUpdateInput,
) {
  return proxyApiFetch(`/api/proxy/exams/${examId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTeacherExam(examId: string) {
  return proxyApiFetch(`/api/proxy/exams/${examId}`, {
    method: "DELETE",
  });
}
