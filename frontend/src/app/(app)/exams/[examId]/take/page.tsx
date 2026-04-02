import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { ExamTakeShell } from "@/components/forms/exam-take-shell";
import { Button } from "@/components/ui/button";
import { getExam, getExamQuestions } from "@/features/exams/api";
import { requireSession } from "@/lib/auth/session";

type ExamTakePageProps = {
  params: Promise<{
    examId: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExamTakePage({
  params,
  searchParams,
}: ExamTakePageProps) {
  const { examId } = await params;
  const query = await searchParams;
  const examSessionId = Array.isArray(query.session) ? query.session[0] : query.session;
  const expiresAt = Array.isArray(query.expiresAt) ? query.expiresAt[0] : query.expiresAt;

  await requireSession(`/exams/${examId}/take`);

  if (!examSessionId || !expiresAt) {
    return (
      <PageShell>
        <EmptyState
          title="Thiếu thông tin phiên thi"
          description="Bạn cần bắt đầu bài thi từ màn hình chi tiết để nhận `examSessionId` và `expiresAt`."
          actionHref={`/exams/${examId}`}
          actionLabel="Quay lại chi tiết đề"
        />
      </PageShell>
    );
  }

  const [exam, questions] = await Promise.all([
    getExam(examId),
    getExamQuestions(examId),
  ]);

  if (!exam?.data || !questions?.data?.length) {
    return (
      <PageShell>
        <SectionHeading
          title="Bài thi chưa sẵn sàng"
          description="Question bank chưa có dữ liệu hoặc endpoint chưa hoàn thiện."
        />
        <Button asChild className="w-fit">
          <Link href={`/exams/${examId}`}>Quay lại chi tiết đề</Link>
        </Button>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionHeading
        eyebrow="Take Exam"
        title={exam.data.title}
        description="Chọn đáp án, theo dõi thời gian còn lại và nộp bài khi hoàn tất."
      />
      <ExamTakeShell
        examId={examId}
        examSessionId={examSessionId}
        expiresAt={expiresAt}
        questions={questions.data}
      />
    </PageShell>
  );
}
