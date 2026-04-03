import { SectionHeading } from "@/components/app/section-heading";
import { TeacherLessonForm } from "@/components/forms/teacher-lesson-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTeacherSession } from "@/lib/auth/session";

type TeacherNewLessonPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function TeacherNewLessonPage({
  params,
}: TeacherNewLessonPageProps) {
  await requireTeacherSession("/teacher/courses");
  const { courseId } = await params;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Create Lesson"
        title="Tạo lesson mới"
      />
      <Card>
        <CardHeader>
          <CardTitle>Lesson form</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherLessonForm
            mode="create"
            courseId={courseId}
            initialValues={{
              title: "",
              contentType: "VIDEO",
              content: "",
              attachmentUrl: "",
              orderIndex: 1,
              isPreview: "false",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
