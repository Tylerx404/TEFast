import { SectionHeading } from "@/components/app/section-heading";
import { TeacherExamForm } from "@/components/forms/teacher-exam-form";
import { DeleteResourceButton } from "@/components/teacher/delete-resource-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTeacherCourses } from "@/features/teacher/courses";
import { deleteTeacherExam, getTeacherExam } from "@/features/teacher/exams";
import { requireTeacherSession } from "@/lib/auth/session";

type TeacherEditExamPageProps = {
  params: Promise<{
    examId: string;
  }>;
};

export default async function TeacherEditExamPage({
  params,
}: TeacherEditExamPageProps) {
  const session = await requireTeacherSession("/teacher/exams");
  const { examId } = await params;
  const [exam, courses] = await Promise.all([
    getTeacherExam(examId),
    getTeacherCourses(session, { limit: "100" }),
  ]);

  if (!exam?.data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading eyebrow="Edit Exam" title={exam.data.title} />
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <a href={`/teacher/exams/${examId}`}>Quay lại chi tiết</a>
          </Button>
          <DeleteResourceButton
            label="Exam"
            description="Đề thi sẽ bị xóa khỏi teacher area."
            onDelete={() => deleteTeacherExam(examId)}
            redirectTo="/teacher/exams"
          />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Exam form</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherExamForm
            mode="edit"
            examId={examId}
            courseOptions={(courses?.data ?? []).map((course) => ({
              id: course.id,
              title: course.title,
            }))}
            initialValues={{
              courseId: exam.data.courseId ?? "",
              title: exam.data.title,
              category: exam.data.category,
              examType: exam.data.examType,
              durationMinutes: exam.data.durationMinutes,
              instructions: exam.data.instructions ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
