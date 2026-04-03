import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { SectionHeading } from "@/components/app/section-heading";
import {
  TeacherLessonOrderForm,
} from "@/components/forms/teacher-lesson-form";
import { DeleteResourceButton } from "@/components/teacher/delete-resource-button";
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
import { getTeacherCourse } from "@/features/teacher/courses";
import { deleteTeacherLesson, getTeacherLessons } from "@/features/teacher/lessons";
import { requireTeacherSession } from "@/lib/auth/session";

type TeacherCourseLessonsPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function TeacherCourseLessonsPage({
  params,
}: TeacherCourseLessonsPageProps) {
  await requireTeacherSession("/teacher/courses");
  const { courseId } = await params;
  const [course, lessons] = await Promise.all([
    getTeacherCourse(courseId),
    getTeacherLessons(courseId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Lesson Management"
          title={`Lessons của ${course?.data?.title ?? "course"}`}
          description="Cập nhật nội dung, preview và thứ tự lesson theo course."
        />
        <Button asChild>
          <Link href={`/teacher/courses/${courseId}/lessons/new`}>Tạo lesson</Link>
        </Button>
      </div>

      {lessons?.data?.length ? (
        <div className="rounded-[1.75rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.data.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell className="font-medium">{lesson.title}</TableCell>
                  <TableCell>{lesson.contentType ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={lesson.isPreview ? "default" : "secondary"}>
                      {lesson.isPreview ? "Preview" : "Locked"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <TeacherLessonOrderForm
                      lessonId={lesson.id}
                      initialOrderIndex={lesson.orderIndex}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/teacher/lessons/${lesson.id}/edit`}>Edit</Link>
                      </Button>
                      <DeleteResourceButton
                        label="Lesson"
                        description="Lesson sẽ bị xóa khỏi course hiện tại."
                        onDelete={() => deleteTeacherLesson(lesson.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          title="Chưa có lesson"
          description="Tạo lesson đầu tiên cho course này."
          actionHref={`/teacher/courses/${courseId}/lessons/new`}
          actionLabel="Tạo lesson"
        />
      )}
    </div>
  );
}
