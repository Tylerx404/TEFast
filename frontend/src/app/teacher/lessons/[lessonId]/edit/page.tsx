import { SectionHeading } from "@/components/app/section-heading";
import { TeacherLessonForm } from "@/components/forms/teacher-lesson-form";
import { DeleteResourceButton } from "@/components/teacher/delete-resource-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteTeacherLesson, getTeacherLesson } from "@/features/teacher/lessons";
import { requireTeacherSession } from "@/lib/auth/session";

type TeacherEditLessonPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

export default async function TeacherEditLessonPage({
  params,
}: TeacherEditLessonPageProps) {
  await requireTeacherSession("/teacher/courses");
  const { lessonId } = await params;
  const lesson = await getTeacherLesson(lessonId);

  if (!lesson?.data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading eyebrow="Edit Lesson" title={lesson.data.title} />
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <a href={`/teacher/courses/${lesson.data.courseId}/lessons`}>Quay lại lessons</a>
          </Button>
          <DeleteResourceButton
            label="Lesson"
            description="Lesson sẽ bị xóa khỏi course."
            onDelete={() => deleteTeacherLesson(lessonId)}
            redirectTo={`/teacher/courses/${lesson.data.courseId}/lessons`}
          />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lesson form</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherLessonForm
            mode="edit"
            courseId={lesson.data.courseId}
            lessonId={lessonId}
            initialValues={{
              title: lesson.data.title,
              contentType: lesson.data.contentType,
              content: lesson.data.content,
              attachmentUrl: lesson.data.attachmentUrl ?? "",
              orderIndex: lesson.data.orderIndex,
              isPreview: lesson.data.isPreview ? "true" : "false",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
