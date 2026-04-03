import { EmptyState } from "@/components/app/empty-state";
import { SectionHeading } from "@/components/app/section-heading";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTeacherCourse, getTeacherCourseEnrollments } from "@/features/teacher/courses";
import { requireTeacherSession } from "@/lib/auth/session";

type TeacherCourseStudentsPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function TeacherCourseStudentsPage({
  params,
}: TeacherCourseStudentsPageProps) {
  await requireTeacherSession("/teacher/courses");
  const { courseId } = await params;
  const [course, enrollments] = await Promise.all([
    getTeacherCourse(courseId),
    getTeacherCourseEnrollments(courseId, { page: 1, limit: 50 }),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Course Students"
        title={`Học viên của ${course?.data?.title ?? "course"}`}
      />
      {enrollments?.data?.length ? (
        <div className="rounded-[1.75rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.user.fullName}</TableCell>
                  <TableCell>{item.progressPercent}%</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          title="Chưa có học viên"
          description="Danh sách học viên sẽ hiện ở đây khi course có enrollment."
        />
      )}
    </div>
  );
}
