import { buildQueryString, proxyApiFetch } from "@/lib/api/client";
import { safeServerApiFetch } from "@/lib/api/server";
import type {
  CourseCreateInput,
  CourseDetail,
  CourseEnrollmentItem,
  CourseListItem,
  CourseUpdateInput,
  SessionUser,
} from "@/types/domain";
import type { CourseFilters } from "@/types/forms";

export async function getTeacherCourses(
  session: SessionUser,
  filters: CourseFilters = {},
) {
  const normalizedFilters =
    session.role === "TEACHER"
      ? { ...filters, teacherId: session.id }
      : filters;

  return safeServerApiFetch<CourseListItem[]>(
    `/courses${buildQueryString(normalizedFilters)}`,
    undefined,
    { auth: true },
  );
}

export async function getTeacherCourse(courseId: string) {
  return safeServerApiFetch<CourseDetail>(`/courses/${courseId}`, undefined, {
    auth: true,
  });
}

export async function getTeacherCourseEnrollments(
  courseId: string,
  filters: Record<string, string | number | boolean> = {},
) {
  return safeServerApiFetch<CourseEnrollmentItem[]>(
    `/courses/${courseId}/enrollments${buildQueryString(filters)}`,
    undefined,
    { auth: true },
  );
}

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
