import { SectionHeading } from "@/components/app/section-heading";
import { TeacherExamForm } from "@/components/forms/teacher-exam-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTeacherCourses } from "@/features/teacher/courses";
import { requireTeacherSession } from "@/lib/auth/session";

export default async function TeacherNewExamPage() {
  const session = await requireTeacherSession("/teacher/exams");
  const courses = await getTeacherCourses(session, { limit: "100" });

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Create Exam" title="Tạo đề thi mới" />
      <Card>
        <CardHeader>
          <CardTitle>Exam form</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherExamForm
            mode="create"
            courseOptions={(courses?.data ?? []).map((course) => ({
              id: course.id,
              title: course.title,
            }))}
            initialValues={{
              courseId: courses?.data?.[0]?.id ?? "",
              title: "",
              category: "IELTS",
              examType: "PRACTICE",
              durationMinutes: 45,
              instructions: "",
              isPublished: "false",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
