import { buildQueryString } from "@/lib/api/client";
import { safeServerApiFetch } from "@/lib/api/server";
import type { VocabularyItem } from "@/types/domain";
import type { VocabularyFilters } from "@/types/forms";

export async function getVocabulary(filters: VocabularyFilters = {}) {
  return safeServerApiFetch<VocabularyItem[]>(
    `/vocabulary${buildQueryString(filters)}`,
  );
}

export async function getVocabularyDetail(vocabularyId: string) {
  return safeServerApiFetch<VocabularyItem>(`/vocabulary/${vocabularyId}`);
}
