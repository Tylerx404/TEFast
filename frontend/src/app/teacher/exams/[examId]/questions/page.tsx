import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { SectionHeading } from "@/components/app/section-heading";
import { DeleteResourceButton } from "@/components/teacher/delete-resource-button";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTeacherExam } from "@/features/teacher/exams";
import {
  deleteTeacherQuestion,
  getTeacherQuestions,
} from "@/features/teacher/questions";
import { requireTeacherSession } from "@/lib/auth/session";

type TeacherExamQuestionsPageProps = {
  params: Promise<{
    examId: string;
  }>;
};

export default async function TeacherExamQuestionsPage({
  params,
}: TeacherExamQuestionsPageProps) {
  await requireTeacherSession("/teacher/exams");
  const { examId } = await params;
  const [exam, questions] = await Promise.all([
    getTeacherExam(examId),
    getTeacherQuestions(examId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Question Bank"
          title={`Câu hỏi của ${exam?.data?.title ?? "exam"}`}
        />
        <Button asChild>
          <Link href={`/teacher/exams/${examId}/questions/new`}>Tạo câu hỏi</Link>
        </Button>
      </div>
      {questions?.data?.length ? (
        <div className="rounded-[1.75rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.data.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>{question.section}</TableCell>
                  <TableCell className="max-w-xl">{question.content}</TableCell>
                  <TableCell>{question.orderIndex}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/teacher/questions/${question.id}/edit`}>Edit</Link>
                      </Button>
                      <DeleteResourceButton
                        label="Question"
                        description="Câu hỏi này sẽ bị xóa khỏi exam."
                        onDelete={() => deleteTeacherQuestion(question.id)}
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
          title="Chưa có câu hỏi"
          description="Tạo câu hỏi đầu tiên cho exam này."
          actionHref={`/teacher/exams/${examId}/questions/new`}
          actionLabel="Tạo câu hỏi"
        />
      )}
    </div>
  );
}
