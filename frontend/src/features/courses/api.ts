import { buildQueryString } from "@/lib/api/client";
import { safeServerApiFetch } from "@/lib/api/server";
import type { CourseFilters } from "@/types/forms";
import type { CourseDetail, CourseLesson, CourseListItem, ExamListItem } from "@/types/domain";

export async function getCourses(filters: CourseFilters = {}) {
  return safeServerApiFetch<CourseListItem[]>(
    `/courses${buildQueryString(filters)}`,
  );
}

export async function getCourse(courseId: string) {
  return safeServerApiFetch<CourseDetail>(`/courses/${courseId}`);
}

export async function getCourseLessons(courseId: string, auth = false) {
  return safeServerApiFetch<CourseLesson[]>(
    `/courses/${courseId}/lessons`,
    undefined,
    { auth },
  );
}

export async function getCourseExams(courseId: string) {
  return safeServerApiFetch<ExamListItem[]>(
    `/exams${buildQueryString({ courseId, limit: 20 })}`,
  );
}
