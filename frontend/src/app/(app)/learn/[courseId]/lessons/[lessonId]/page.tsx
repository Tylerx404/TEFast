import Link from "next/link";
import { Download, PlayCircle } from "lucide-react";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/app/empty-state";
import { LessonProgressTracker } from "@/components/app/lesson-progress-tracker";
import { PageShell } from "@/components/app/page-shell";
import { CommentThread } from "@/components/forms/comment-thread";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCourse, getCourseLessons } from "@/features/courses/api";
import { getMyEnrollments } from "@/features/enrollments/api";
import { getCourseLesson, getLessonComments } from "@/features/lessons/api";
import { getSession, requireSession } from "@/lib/auth/session";

type LessonPageProps = {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseId: courseKey, lessonId: lessonKey } = await params;
  const redirectTo = `/learn/${courseKey}/lessons/${lessonKey}`;

  await requireSession(redirectTo);

  const [course, session, enrollments] = await Promise.all([
    getCourse(courseKey),
    getSession(),
    getMyEnrollments({ limit: "100" }),
  ]);

  if (!course?.data) {
    return (
      <PageShell>
        <EmptyState
          title="Khong lay duoc thong tin khoa hoc"
          description="Khoa hoc nay hien khong kha dung hoac da bi go khoi he thong."
          actionHref="/courses"
          actionLabel="Quay lai khoa hoc"
        />
      </PageShell>
    );
  }

  const courseId = course.data.id;
  const courseSlug = course.data.slug;

  const [lessons, lesson] = await Promise.all([
    getCourseLessons(courseKey, true),
    getCourseLesson(courseKey, lessonKey),
  ]);

  if (!lesson?.data) {
    return (
      <PageShell>
        <EmptyState
          title="Khong lay duoc du lieu lesson"
          description="Ban co the chua co quyen truy cap hoac bai hoc nay hien khong kha dung."
          actionHref={`/courses/${courseSlug}`}
          actionLabel="Quay lai khoa hoc"
        />
      </PageShell>
    );
  }

  const currentLesson = lesson.data;
  const canonicalLessonKey = String(currentLesson.orderIndex);

  if (courseKey !== courseSlug || lessonKey !== canonicalLessonKey) {
    redirect(`/learn/${courseSlug}/lessons/${canonicalLessonKey}`);
  }

  const comments = await getLessonComments(courseId, currentLesson.id);
  const currentLessonIndex =
    lessons?.data?.findIndex((item) => item.id === currentLesson.id) ?? -1;
  const enrollment =
    enrollments?.data?.find((item) => item.courseId === courseId) ?? null;
  const progressPercent =
    lessons?.data?.length && currentLessonIndex >= 0
      ? Number((((currentLessonIndex + 1) / lessons.data.length) * 100).toFixed(2))
      : 0;
  const progressStatus =
    lessons?.data?.length && currentLessonIndex === lessons.data.length - 1
      ? "COMPLETED"
      : "ACTIVE";

  return (
    <PageShell className="gap-6">
      {enrollment ? (
        <LessonProgressTracker
          enrollmentId={enrollment.id}
          lessonId={currentLesson.id}
          progressPercent={progressPercent}
          status={progressStatus}
        />
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[0.34fr_0.66fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{course.data.title ?? "Course lessons"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lessons?.data?.map((item) => (
              <Link
                key={item.id}
                href={`/learn/${courseSlug}/lessons/${item.orderIndex}`}
                className={`block rounded-[1.5rem] border px-4 py-4 transition ${
                  item.id === currentLesson.id
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
                <Badge>{currentLesson.contentType}</Badge>
                {currentLesson.isPreview ? <Badge variant="outline">Preview</Badge> : null}
              </div>
              <CardTitle className="text-3xl">{currentLesson.title}</CardTitle>
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
                      Noi dung bai hoc dang duoc render truc tiep tu du lieu lesson.
                    </p>
                  </div>
                </div>
                <pre className="mt-5 overflow-x-auto rounded-[1.5rem] bg-[#221d19] p-4 text-sm text-[#f8f1e5]">
                  {currentLesson.content}
                </pre>
              </div>

              {currentLesson.attachmentUrl ? (
                <Button asChild variant="outline">
                  <a href={currentLesson.attachmentUrl}>
                    <Download className="h-4 w-4" />
                    Tai tai lieu dinh kem
                  </a>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thao luan bai hoc</CardTitle>
            </CardHeader>
            <CardContent>
              <CommentThread
                comments={comments?.data ?? []}
                session={session}
                courseId={courseId}
                lessonId={currentLesson.id}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
