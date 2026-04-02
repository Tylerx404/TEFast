import { SectionHeading } from "@/components/app/section-heading";
import { TeacherCourseForm } from "@/components/forms/teacher-course-form";
import { DeleteResourceButton } from "@/components/teacher/delete-resource-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteTeacherCourse, getTeacherCourse } from "@/features/teacher/courses";
import { requireTeacherSession } from "@/lib/auth/session";

type TeacherEditCoursePageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function TeacherEditCoursePage({
  params,
}: TeacherEditCoursePageProps) {
  await requireTeacherSession("/teacher/courses");
  const { courseId } = await params;
  const course = await getTeacherCourse(courseId);

  if (!course?.data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Edit Course"
          title={`Chỉnh sửa ${course.data.title}`}
        />
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <a href={`/teacher/courses/${courseId}`}>Quay lại chi tiết</a>
          </Button>
          <DeleteResourceButton
            label="Course"
            description="Xóa khóa học sẽ làm mất khả năng truy cập tới course này."
            onDelete={() => deleteTeacherCourse(courseId)}
            redirectTo="/teacher/courses"
          />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Course form</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherCourseForm
            mode="edit"
            courseId={courseId}
            initialValues={{
              title: course.data.title,
              slug: course.data.slug,
              description: course.data.description ?? "",
              category: course.data.category,
              level: course.data.level,
              price: course.data.price ?? 0,
              thumbnailUrl: course.data.thumbnailUrl ?? "",
              isPublished: course.data.isPublished ? "true" : "false",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
