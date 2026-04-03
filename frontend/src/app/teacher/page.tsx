import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { SectionHeading } from "@/components/app/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTeacherCourses } from "@/features/teacher/courses";
import { getTeacherExams } from "@/features/teacher/exams";
import { getTeacherVocabulary } from "@/features/teacher/vocabulary";
import { requireTeacherSession } from "@/lib/auth/session";

export default async function TeacherDashboardPage() {
  const session = await requireTeacherSession("/teacher");
  const [courses, exams, vocabulary] = await Promise.all([
    getTeacherCourses(session, { limit: "5" }),
    getTeacherExams(session, { limit: 20 }),
    getTeacherVocabulary({ limit: "1" }),
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Teacher Dashboard"
        title="Quản lý nội dung giảng dạy của bạn"
        description="Từ đây bạn có thể tạo khóa học, thêm bài học, ra đề, quản lý câu hỏi và theo dõi kết quả học viên."
      />

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{courses?.meta?.total ?? courses?.data?.length ?? 0}</p>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Khóa học bạn đang quản lý.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{exams?.meta?.total ?? exams?.data?.length ?? 0}</p>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Đề thi hiện có trong teacher area.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vocabulary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{vocabulary?.meta?.total ?? vocabulary?.data?.length ?? 0}</p>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Mục từ có thể chỉnh sửa.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.55fr_0.45fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Recent courses</CardTitle>
            </div>
            <Button asChild>
              <Link href="/teacher/courses/new">Tạo course</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {courses?.data?.length ? (
              courses.data.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between rounded-[1.25rem] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-4"
                >
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge>{course.category}</Badge>
                      <Badge variant="secondary">{course.level}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/teacher/courses/${course.id}`}>Mở</Link>
                  </Button>
                </div>
              ))
            ) : (
              <EmptyState
                title="Chưa có course"
                description="Tạo course đầu tiên để bắt đầu teacher workflow."
                actionHref="/teacher/courses/new"
                actionLabel="Tạo course"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Quick links</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/teacher/exams/new">Tạo đề thi mới</Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/teacher/vocabulary/new">Thêm từ vựng</Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/teacher/uploads">Mở upload utility</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
