import { SectionHeading } from "@/components/app/section-heading";
import { TeacherQuestionForm } from "@/components/forms/teacher-question-form";
import { DeleteResourceButton } from "@/components/teacher/delete-resource-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTeacherQuestion,
} from "@/features/teacher/questions";
import { requireTeacherSession } from "@/lib/auth/session";

type TeacherEditQuestionPageProps = {
  params: Promise<{
    questionId: string;
  }>;
};

export default async function TeacherEditQuestionPage({
  params,
}: TeacherEditQuestionPageProps) {
  await requireTeacherSession("/teacher/exams");
  const { questionId } = await params;
  const question = await getTeacherQuestion(questionId);

  if (!question?.data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading eyebrow="Edit Question" title={question.data.section} />
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <a href={`/teacher/exams/${question.data.examId}/questions`}>Quay lại question bank</a>
          </Button>
          <DeleteResourceButton
            label="Question"
            description="Câu hỏi này sẽ bị xóa khỏi exam."
            deletePath={`/api/proxy/questions/${questionId}`}
            redirectTo={`/teacher/exams/${question.data.examId}/questions`}
          />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Question form</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherQuestionForm
            mode="edit"
            examId={question.data.examId}
            questionId={questionId}
            initialValues={{
              section: question.data.section,
              content: question.data.content,
              options: (question.data.options.length
                ? question.data.options
                : ["", "", "", ""]
              ).map((option) => ({ value: option })),
              correctAnswer: question.data.correctAnswer ?? "",
              explanation: question.data.explanation ?? "",
              orderIndex: question.data.orderIndex,
              audioUrl: question.data.audioUrl ?? "",
              imageUrl: question.data.imageUrl ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
