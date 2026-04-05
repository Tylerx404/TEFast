import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Layers3, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/app/empty-state";
import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { EnrollCourseButton } from "@/components/forms/enroll-course-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCourse, getCourseExams, getCourseLessons } from "@/features/courses/api";
import { getMyEnrollments } from "@/features/enrollments/api";
import { getSession } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/utils";

type CourseDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id: courseKey } = await params;
  const [course, session] = await Promise.all([
    getCourse(courseKey),
    getSession(),
  ]);

  if (!course?.data) {
    return (
      <PageShell>
        <EmptyState
          title="Chua lay duoc thong tin khoa hoc"
          description="Kiem tra lai API GET /courses/:slug hoac quay ve catalog de chon khoa hoc khac."
          actionHref="/courses"
          actionLabel="Quay lai courses"
        />
      </PageShell>
    );
  }

  const courseId = course.data.id;
  const courseSlug = course.data.slug;

  if (courseKey !== courseSlug) {
    redirect(`/courses/${courseSlug}`);
  }

  const [lessons, exams, enrollmentList] = await Promise.all([
    getCourseLessons(courseId),
    getCourseExams(courseId),
    session ? getMyEnrollments({ limit: "100" }) : Promise.resolve(null),
  ]);
  const isEnrolled = Boolean(
    enrollmentList?.data?.some((item) => item.courseId === courseId),
  );

  return (
    <PageShell className="gap-10">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>{course.data.category}</Badge>
            <Badge variant="secondary">{course.data.level}</Badge>
            {course.data.isPublished ? <Badge variant="outline">Published</Badge> : null}
          </div>
          <SectionHeading
            title={course.data.title}
            description={
              course.data.description ||
              "Khoa hoc nay dang duoc cap nhat them noi dung va thong tin chi tiet."
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-[hsl(var(--background))] shadow-none">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="rounded-2xl bg-[hsl(var(--muted))] p-3">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Lessons</p>
                  <p className="text-xl font-semibold">
                    {course.data.stats?.lessonCount ?? lessons?.data?.length ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--background))] shadow-none">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="rounded-2xl bg-[hsl(var(--muted))] p-3">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Exams</p>
                  <p className="text-xl font-semibold">
                    {course.data.stats?.examCount ?? exams?.data?.length ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--background))] shadow-none">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="rounded-2xl bg-[hsl(var(--muted))] p-3">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Enrollments</p>
                  <p className="text-xl font-semibold">
                    {course.data.stats?.enrollmentCount ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thong tin nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">Giang vien</span>
              <span className="font-medium">
                {course.data.teacher?.fullName ?? "TEFast Academy"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">Hoc phi</span>
              <span className="font-medium">{formatCurrency(course.data.price)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">Trang thai</span>
              <span className="font-medium">
                {isEnrolled ? "Da dang ky" : "Chua dang ky"}
              </span>
            </div>
            <EnrollCourseButton
              courseId={courseId}
              isAuthenticated={Boolean(session)}
              isEnrolled={isEnrolled}
              redirectTo={`/courses/${courseSlug}`}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.55fr_0.45fr]">
        <Card>
          <CardHeader>
            <CardTitle>Noi dung bai hoc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lessons?.data?.length ? (
              lessons.data.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-4"
                >
                  <div>
                    <p className="font-medium">{lesson.title}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Lesson {lesson.orderIndex} {lesson.isPreview ? "- Preview" : ""}
                    </p>
                  </div>
                  {isEnrolled || lesson.isPreview ? (
                    <Button variant="outline" asChild>
                      <Link href={`/learn/${courseSlug}/lessons/${lesson.orderIndex}`}>
                        Vao bai
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      Can enroll
                    </span>
                  )}
                </div>
              ))
            ) : (
              <EmptyState
                title="Chua co lesson"
                description="Khoa hoc nay hien chua co bai hoc nao de bat dau."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Practice exams</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exams?.data?.length ? (
              exams.data.map((exam) => (
                <div
                  key={exam.id}
                  className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4"
                >
                  <p className="font-medium">{exam.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-4 w-4" />
                      {exam.durationMinutes} phut
                    </span>
                    <span>{exam.totalQuestions} cau hoi</span>
                  </div>
                  <Button className="mt-4 w-full justify-between" asChild>
                    <Link href={`/exams/${exam.id}`}>
                      Xem de thi
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <EmptyState
                title="Chua co de thi"
                description="Hien chua co bai thi luyen tap nao cho khoa hoc nay."
              />
            )}
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
