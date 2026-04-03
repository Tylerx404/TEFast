import { proxyApiFetch } from "@/lib/api/client";
import type { CourseCreateInput, CourseUpdateInput } from "@/types/domain";

export async function createTeacherCourse(payload: CourseCreateInput) {
  return proxyApiFetch<{ id: string }>(`/api/proxy/courses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTeacherCourse(
  courseId: string,
  payload: CourseUpdateInput,
) {
  return proxyApiFetch(`/api/proxy/courses/${courseId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTeacherCourse(courseId: string) {
  return proxyApiFetch(`/api/proxy/courses/${courseId}`, {
    method: "DELETE",
  });
}
