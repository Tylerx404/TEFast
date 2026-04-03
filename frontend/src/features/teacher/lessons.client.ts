import { proxyApiFetch } from "@/lib/api/client";
import type {
  LessonCreateInput,
  LessonOrderUpdateInput,
  LessonUpdateInput,
} from "@/types/domain";

export async function createTeacherLesson(
  courseId: string,
  payload: LessonCreateInput,
) {
  return proxyApiFetch(`/api/proxy/courses/${courseId}/lessons`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTeacherLesson(
  lessonId: string,
  payload: LessonUpdateInput,
) {
  return proxyApiFetch(`/api/proxy/lessons/${lessonId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateTeacherLessonOrder(
  lessonId: string,
  payload: LessonOrderUpdateInput,
) {
  return proxyApiFetch(`/api/proxy/lessons/${lessonId}/order`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTeacherLesson(lessonId: string) {
  return proxyApiFetch(`/api/proxy/lessons/${lessonId}`, {
    method: "DELETE",
  });
}
