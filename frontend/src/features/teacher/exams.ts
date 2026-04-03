import { buildQueryString, proxyApiFetch } from "@/lib/api/client";
import type {
  ExamCreateInput,
  ExamDetail,
  ExamListItem,
  ExamUpdateInput,
  SessionUser,
} from "@/types/domain";

async function getSafeServerApiFetch() {
  const { safeServerApiFetch } = await import("@/lib/api/server");
  return safeServerApiFetch;
}

export async function getTeacherExams(
  session: SessionUser,
  filters: Record<string, string | number | boolean> = {},
) {
  const safeServerApiFetch = await getSafeServerApiFetch();
  if (session.role === "ADMIN") {
    return safeServerApiFetch<ExamListItem[]>(
      `/exams${buildQueryString({ limit: 100, ...filters })}`,
      undefined,
      { auth: true },
    );
  }

  const coursesResponse = await safeServerApiFetch<{ id: string }[]>(
    `/courses${buildQueryString({ teacherId: session.id, limit: 100 })}`,
    undefined,
    { auth: true },
  );

  const courseIds = coursesResponse?.data?.map((course) => course.id) ?? [];

  if (!courseIds.length) {
    return {
      data: [],
      meta: null,
      message: "No teacher exams found",
    };
  }

  const examGroups = await Promise.all(
    courseIds.map((courseId) =>
      safeServerApiFetch<ExamListItem[]>(
        `/exams${buildQueryString({ courseId, limit: 100, ...filters })}`,
        undefined,
        { auth: true },
      ),
    ),
  );

  return {
    data: examGroups.flatMap((group) => group?.data ?? []),
    meta: {
      page: 1,
      limit: examGroups.reduce(
        (total, group) => total + (group?.meta?.limit ?? 0),
        0,
      ),
      total: examGroups.reduce(
        (total, group) => total + (group?.meta?.total ?? group?.data?.length ?? 0),
        0,
      ),
      totalPages: 1,
    },
    message: "Teacher exams fetched",
  };
}

export async function getTeacherExam(examId: string) {
  const safeServerApiFetch = await getSafeServerApiFetch();
  return safeServerApiFetch<ExamDetail>(`/exams/${examId}`, undefined, {
    auth: true,
  });
}

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
