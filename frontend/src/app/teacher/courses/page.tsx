import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { SectionHeading } from "@/components/app/section-heading";
import { CourseFilters } from "@/components/forms/course-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTeacherCourses } from "@/features/teacher/courses";
import { requireTeacherSession } from "@/lib/auth/session";

type TeacherCoursesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TeacherCoursesPage({
  searchParams,
}: TeacherCoursesPageProps) {
  const session = await requireTeacherSession("/teacher/courses");
  const params = await searchParams;
  const filters = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const courses = await getTeacherCourses(session, filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Teacher Courses"
          title="Danh sách khóa học quản lý"
          description="Dùng bộ lọc hiện có để tìm course theo category, keyword và trạng thái publish."
        />
        <Button asChild>
          <Link href="/teacher/courses/new">Tạo course</Link>
        </Button>
      </div>
      <CourseFilters />
      {courses?.data?.length ? (
        <div className="rounded-[1.75rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.data.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>
                    <Badge>{course.category}</Badge>
                  </TableCell>
                  <TableCell>{course.level}</TableCell>
                  <TableCell>
                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" asChild>
                      <Link href={`/teacher/courses/${course.id}`}>Quản lý</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          title="Chưa có khóa học phù hợp"
          description="Hãy tạo course đầu tiên hoặc thử thay đổi bộ lọc."
          actionHref="/teacher/courses/new"
          actionLabel="Tạo course"
        />
      )}
    </div>
  );
}
