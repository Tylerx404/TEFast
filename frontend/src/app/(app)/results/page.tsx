import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyResults } from "@/features/results/api";
import { requireSession } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";

export default async function ResultsPage() {
  await requireSession("/results");
  const results = await getMyResults({
    limit: "20",
  });

  return (
    <PageShell>
      <SectionHeading
        eyebrow="Exam Results"
        title="Lịch sử kết quả gần đây"
        description="Tất cả bài làm đã submit sẽ được tổng hợp ở đây để bạn theo dõi tiến độ."
      />
      {results?.data?.length ? (
        <div className="rounded-[1.75rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bài thi</TableHead>
                <TableHead>Điểm</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.data.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.examTitle ?? result.examId}</TableCell>
                  <TableCell>
                    <Badge>{result.score}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(result.submittedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/results/${result.publicSlug ?? result.id}`}
                      className="font-medium text-[hsl(var(--primary))]"
                    >
                      Xem
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          title="Bạn chưa có kết quả nào"
          description="Hãy bắt đầu một bài thi practice để kết quả đầu tiên xuất hiện tại đây."
          actionHref="/courses"
          actionLabel="Tìm bài thi"
        />
      )}
    </PageShell>
  );
}
