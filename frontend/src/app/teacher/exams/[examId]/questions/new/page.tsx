import { SectionHeading } from "@/components/app/section-heading";
import { TeacherQuestionForm } from "@/components/forms/teacher-question-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTeacherSession } from "@/lib/auth/session";

type TeacherNewQuestionPageProps = {
  params: Promise<{
    examId: string;
  }>;
};

export default async function TeacherNewQuestionPage({
  params,
}: TeacherNewQuestionPageProps) {
  await requireTeacherSession("/teacher/exams");
  const { examId } = await params;

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Create Question" title="Tạo câu hỏi mới" />
      <Card>
        <CardHeader>
          <CardTitle>Question form</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherQuestionForm
            mode="create"
            examId={examId}
            initialValues={{
              section: "PART_1",
              content: "",
              options: [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
              correctAnswer: "",
              explanation: "",
              orderIndex: 1,
              audioUrl: "",
              imageUrl: "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
