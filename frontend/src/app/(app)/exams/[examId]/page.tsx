import { Clock3, FileText, ListChecks } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { StartExamButton } from "@/components/forms/start-exam-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExam } from "@/features/exams/api";
import { getSession } from "@/lib/auth/session";

type ExamDetailPageProps = {
  params: Promise<{
    examId: string;
  }>;
};

export default async function ExamDetailPage({ params }: ExamDetailPageProps) {
  const { examId } = await params;
  const [exam, session] = await Promise.all([getExam(examId), getSession()]);

  if (!exam?.data) {
    return (
      <PageShell>
        <EmptyState
          title="Chưa lấy được đề thi"
          description="Kiểm tra endpoint `GET /exams/:id` hoặc thử lại sau."
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionHeading
        eyebrow="Exam Detail"
        title={exam.data.title}
        description={exam.data.instructions || "Đọc kỹ hướng dẫn trước khi bắt đầu làm bài."}
      />
      <div className="grid gap-6 lg:grid-cols-[0.55fr_0.45fr]">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin bài thi</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
              <Clock3 className="h-5 w-5 text-[hsl(var(--primary))]" />
              <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Thời lượng</p>
              <p className="text-xl font-semibold">{exam.data.durationMinutes} phút</p>
            </div>
            <div className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
              <ListChecks className="h-5 w-5 text-[hsl(var(--primary))]" />
              <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Số câu hỏi</p>
              <p className="text-xl font-semibold">{exam.data.totalQuestions}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
              <FileText className="h-5 w-5 text-[hsl(var(--primary))]" />
              <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Loại đề</p>
              <p className="text-xl font-semibold">{exam.data.examType}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sẵn sàng làm bài</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="leading-7 text-[hsl(var(--muted-foreground))]">
              Khi bắt đầu, frontend sẽ gọi `POST /exams/:id/start` để tạo exam session và điều hướng bạn vào màn hình làm bài có timer.
            </p>
            <StartExamButton
              examId={examId}
              redirectTo={`/exams/${examId}`}
              isAuthenticated={Boolean(session)}
            />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
