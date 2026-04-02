import { buildQueryString } from "@/lib/api/client";
import { safeServerApiFetch } from "@/lib/api/server";
import type { CommentItem, LessonDetail } from "@/types/domain";

export async function getLesson(lessonId: string) {
  return safeServerApiFetch<LessonDetail>(`/lessons/${lessonId}`, undefined, {
    auth: true,
  });
}

export async function getLessonComments(courseId: string, lessonId: string) {
  return safeServerApiFetch<CommentItem[]>(
    `/comments${buildQueryString({ courseId, lessonId, page: 1, limit: 20 })}`,
  );
}
