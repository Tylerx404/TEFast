import { buildQueryString, proxyApiFetch } from "@/lib/api/client";
import { safeServerApiFetch } from "@/lib/api/server";
import type {
  VocabularyCreateInput,
  VocabularyItem,
  VocabularyUpdateInput,
} from "@/types/domain";
import type { VocabularyFilters } from "@/types/forms";

export async function getTeacherVocabulary(filters: VocabularyFilters = {}) {
  return safeServerApiFetch<VocabularyItem[]>(
    `/vocabulary${buildQueryString(filters)}`,
    undefined,
    { auth: true },
  );
}

export async function getTeacherVocabularyDetail(vocabularyId: string) {
  return safeServerApiFetch<VocabularyItem>(`/vocabulary/${vocabularyId}`, undefined, {
    auth: true,
  });
}

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
