import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { SectionHeading } from "@/components/app/section-heading";
import { DeleteResourceButton } from "@/components/teacher/delete-resource-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteTeacherCourse, getTeacherCourse } from "@/features/teacher/courses";
import { getTeacherLessons } from "@/features/teacher/lessons";
import { requireTeacherSession } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/utils";

type TeacherCourseDetailPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function TeacherCourseDetailPage({
  params,
}: TeacherCourseDetailPageProps) {
  await requireTeacherSession("/teacher/courses");
  const { courseId } = await params;
  const [course, lessons] = await Promise.all([
    getTeacherCourse(courseId),
    getTeacherLessons(courseId),
  ]);

  if (!course?.data) {
    return (
      <EmptyState
        title="Không tải được course"
        description="Khóa học này hiện không khả dụng hoặc bạn không có quyền quản lý."
        actionHref="/teacher/courses"
        actionLabel="Quay lại courses"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Course Detail"
          title={course.data.title}
          description={course.data.description || "Khóa học đang được biên tập."}
        />
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href={`/teacher/courses/${courseId}/edit`}>Chỉnh sửa</Link>
          </Button>
          <DeleteResourceButton
            label="Course"
            description="Thao tác này sẽ xóa course hiện tại. Hãy chắc chắn bạn không cần giữ lại liên kết đến lessons hoặc exams."
            onDelete={() => deleteTeacherCourse(courseId)}
            redirectTo="/teacher/courses"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>{course.data.category}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Price</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(course.data.price)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lessons</CardTitle>
          </CardHeader>
          <CardContent>{lessons?.data?.length ?? 0}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/teacher/courses/${courseId}/lessons`}>Quản lý lessons</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/teacher/courses/${courseId}/students`}>Xem học viên</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/teacher/exams/new">Tạo exam cho course</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
