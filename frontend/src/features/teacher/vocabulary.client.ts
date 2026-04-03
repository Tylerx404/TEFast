import { proxyApiFetch } from "@/lib/api/client";
import type {
  VocabularyCreateInput,
  VocabularyUpdateInput,
} from "@/types/domain";

export async function createTeacherVocabulary(payload: VocabularyCreateInput) {
  return proxyApiFetch<{ id: string }>(`/api/proxy/vocabulary`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTeacherVocabulary(
  vocabularyId: string,
  payload: VocabularyUpdateInput,
) {
  return proxyApiFetch(`/api/proxy/vocabulary/${vocabularyId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTeacherVocabulary(vocabularyId: string) {
  return proxyApiFetch(`/api/proxy/vocabulary/${vocabularyId}`, {
    method: "DELETE",
  });
}
