import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { SectionHeading } from "@/components/app/section-heading";
import { DeleteResourceButton } from "@/components/teacher/delete-resource-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteTeacherExam, getTeacherExam } from "@/features/teacher/exams";
import { getTeacherQuestions } from "@/features/teacher/questions";
import { requireTeacherSession } from "@/lib/auth/session";

type TeacherExamDetailPageProps = {
  params: Promise<{
    examId: string;
  }>;
};

export default async function TeacherExamDetailPage({
  params,
}: TeacherExamDetailPageProps) {
  await requireTeacherSession("/teacher/exams");
  const { examId } = await params;
  const [exam, questions] = await Promise.all([
    getTeacherExam(examId),
    getTeacherQuestions(examId),
  ]);

  if (!exam?.data) {
    return (
      <EmptyState
        title="Không tải được exam"
        description="Kiểm tra lại API exam detail."
        actionHref="/teacher/exams"
        actionLabel="Quay lại exams"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Exam Detail"
          title={exam.data.title}
          description={exam.data.instructions || "Đề thi đang được biên tập."}
        />
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href={`/teacher/exams/${examId}/edit`}>Chỉnh sửa</Link>
          </Button>
          <DeleteResourceButton
            label="Exam"
            description="Xóa đề thi sẽ làm mất question bank liên quan."
            onDelete={() => deleteTeacherExam(examId)}
            redirectTo="/teacher/exams"
          />
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>{exam.data.category}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Type</CardTitle>
          </CardHeader>
          <CardContent>{exam.data.examType}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>{questions?.data?.length ?? 0}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/teacher/exams/${examId}/questions`}>Quản lý câu hỏi</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/teacher/exams/${examId}/results`}>Xem kết quả</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
