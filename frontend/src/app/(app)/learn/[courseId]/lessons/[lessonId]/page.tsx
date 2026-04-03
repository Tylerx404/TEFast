import Link from "next/link";
import { Download, PlayCircle } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { LessonProgressTracker } from "@/components/app/lesson-progress-tracker";
import { PageShell } from "@/components/app/page-shell";
import { CommentThread } from "@/components/forms/comment-thread";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCourse, getCourseLessons } from "@/features/courses/api";
import { getMyEnrollments } from "@/features/enrollments/api";
import { getLessonComments, getLesson } from "@/features/lessons/api";
import { getSession, requireSession } from "@/lib/auth/session";

type LessonPageProps = {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseId, lessonId } = await params;
  const redirectTo = `/learn/${courseId}/lessons/${lessonId}`;

  await requireSession(redirectTo);
  const [course, lessons, lesson, comments, session, enrollments] = await Promise.all([
    getCourse(courseId),
    getCourseLessons(courseId, true),
    getLesson(lessonId),
    getLessonComments(courseId, lessonId),
    getSession(),
    getMyEnrollments({ limit: "100" }),
  ]);

  const currentLessonIndex =
    lessons?.data?.findIndex((item) => item.id === lessonId) ?? -1;
  const enrollment = enrollments?.data?.find((item) => item.courseId === courseId) ?? null;
  const progressPercent =
    lessons?.data?.length && currentLessonIndex >= 0
      ? Number((((currentLessonIndex + 1) / lessons.data.length) * 100).toFixed(2))
      : 0;
  const progressStatus =
    lessons?.data?.length && currentLessonIndex === lessons.data.length - 1
      ? "COMPLETED"
      : "ACTIVE";

  if (!lesson?.data) {
    return (
      <PageShell>
        <EmptyState
          title="Không lấy được dữ liệu lesson"
          description="Kiểm tra lại quyền truy cập hoặc endpoint `GET /lessons/:id`."
          actionHref={`/courses/${courseId}`}
          actionLabel="Quay lại khóa học"
        />
      </PageShell>
    );
  }

  return (
    <PageShell className="gap-6">
      {enrollment ? (
        <LessonProgressTracker
          enrollmentId={enrollment.id}
          lessonId={lessonId}
          progressPercent={progressPercent}
          status={progressStatus}
        />
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[0.34fr_0.66fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{course?.data?.title ?? "Course lessons"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lessons?.data?.map((item) => (
              <Link
                key={item.id}
                href={`/learn/${courseId}/lessons/${item.id}`}
                className={`block rounded-[1.5rem] border px-4 py-4 transition ${
                  item.id === lessonId
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                }`}
              >
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Lesson {item.orderIndex}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <Badge>{lesson.data.contentType}</Badge>
                {lesson.data.isPreview ? <Badge variant="outline">Preview</Badge> : null}
              </div>
              <CardTitle className="text-3xl">{lesson.data.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-[1.75rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[hsl(var(--muted))] p-3">
                    <PlayCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Lesson content</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Nội dung bài học đang được render trực tiếp từ dữ liệu lesson.
                    </p>
                  </div>
                </div>
                <pre className="mt-5 overflow-x-auto rounded-[1.5rem] bg-[#221d19] p-4 text-sm text-[#f8f1e5]">
                  {lesson.data.content}
                </pre>
              </div>

              {lesson.data.attachmentUrl ? (
                <Button asChild variant="outline">
                  <a href={lesson.data.attachmentUrl}>
                    <Download className="h-4 w-4" />
                    Tải tài liệu đính kèm
                  </a>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thảo luận bài học</CardTitle>
            </CardHeader>
            <CardContent>
              <CommentThread
                comments={comments?.data ?? []}
                session={session}
                courseId={courseId}
                lessonId={lessonId}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
