import { EmptyState } from "@/components/app/empty-state";
import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getResult } from "@/features/results/api";
import { requireSession } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";

type ResultDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ResultDetailPage({ params }: ResultDetailPageProps) {
  const { id } = await params;
  await requireSession(`/results/${id}`);
  const result = await getResult(id);

  if (!result?.data) {
    return (
      <PageShell>
        <EmptyState
          title="Không tải được kết quả"
          description="Kiểm tra endpoint `GET /exam-results/:id` hoặc thử lại sau."
          actionHref="/results"
          actionLabel="Quay lại danh sách kết quả"
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionHeading
        eyebrow="Result Detail"
        title={`Kết quả bài thi ${result.data.examId}`}
        description={`Bài làm được nộp vào ${formatDate(result.data.submittedAt)}.`}
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Điểm số</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="text-sm">{result.data.score}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Đúng</CardTitle>
          </CardHeader>
          <CardContent>{result.data.correctCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sai</CardTitle>
          </CardHeader>
          <CardContent>{result.data.wrongCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Thời gian làm</CardTitle>
          </CardHeader>
          <CardContent>{result.data.durationSpentSeconds}s</CardContent>
        </Card>
      </div>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
        </CardHeader>
        <CardContent className="leading-7 text-[hsl(var(--muted-foreground))]">
          {result.data.feedback || "Chưa có feedback review cho bài làm này."}
        </CardContent>
      </Card>
    </PageShell>
  );
}
