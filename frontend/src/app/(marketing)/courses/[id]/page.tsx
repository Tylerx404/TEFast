import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Layers3, Users } from "lucide-react";

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
  const { id } = await params;
  const [course, lessons, exams, session] = await Promise.all([
    getCourse(id),
    getCourseLessons(id),
    getCourseExams(id),
    getSession(),
  ]);

  const enrollmentList = session
    ? await getMyEnrollments({ limit: "100", status: "ACTIVE" })
    : null;
  const isEnrolled = Boolean(
    enrollmentList?.data?.some((item) => item.courseId === id),
  );

  if (!course?.data) {
    return (
      <PageShell>
        <EmptyState
          title="Chưa lấy được thông tin khóa học"
          description="Kiểm tra lại API `GET /courses/:id` hoặc quay về catalog để chọn khóa học khác."
          actionHref="/courses"
          actionLabel="Quay lại courses"
        />
      </PageShell>
    );
  }

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
            description={course.data.description || "Khóa học đang được xây dựng và sẽ cập nhật thêm chi tiết khi backend hoàn thiện."}
          />
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-[hsl(var(--background))] shadow-none">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="rounded-2xl bg-[hsl(var(--muted))] p-3">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Lessons</p>
                  <p className="text-xl font-semibold">{course.data.stats?.lessonCount ?? lessons?.data?.length ?? 0}</p>
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
                  <p className="text-xl font-semibold">{course.data.stats?.examCount ?? exams?.data?.length ?? 0}</p>
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
                  <p className="text-xl font-semibold">{course.data.stats?.enrollmentCount ?? 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">Giảng viên</span>
              <span className="font-medium">{course.data.teacher?.fullName ?? "TEFast Academy"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">Học phí</span>
              <span className="font-medium">{formatCurrency(course.data.price)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">Trạng thái</span>
              <span className="font-medium">
                {isEnrolled ? "Đã đăng ký" : "Chưa đăng ký"}
              </span>
            </div>
            <EnrollCourseButton
              courseId={id}
              isAuthenticated={Boolean(session)}
              isEnrolled={isEnrolled}
              redirectTo={`/courses/${id}`}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.55fr_0.45fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nội dung bài học</CardTitle>
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
                      Lesson {lesson.orderIndex} {lesson.isPreview ? "• Preview" : ""}
                    </p>
                  </div>
                  {isEnrolled || lesson.isPreview ? (
                    <Button variant="outline" asChild>
                      <Link href={`/learn/${id}/lessons/${lesson.id}`}>
                        Vào bài
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      Cần enroll
                    </span>
                  )}
                </div>
              ))
            ) : (
              <EmptyState
                title="Chưa có lesson"
                description="Danh sách bài học sẽ hiện tại đây khi endpoint `/courses/:id/lessons` sẵn sàng."
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
                      {exam.durationMinutes} phút
                    </span>
                    <span>{exam.totalQuestions} câu hỏi</span>
                  </div>
                  <Button className="mt-4 w-full justify-between" asChild>
                    <Link href={`/exams/${exam.id}`}>
                      Xem đề thi
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <EmptyState
                title="Chưa có đề thi"
                description="Khu vực này sẽ render khi `GET /exams?courseId=...` có dữ liệu."
              />
            )}
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
