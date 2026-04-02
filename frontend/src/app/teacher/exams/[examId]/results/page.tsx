import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { SectionHeading } from "@/components/app/section-heading";
import { Badge } from "@/components/ui/badge";
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
import { getTeacherExamResults } from "@/features/teacher/results";
import { requireTeacherSession } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";

type TeacherExamResultsPageProps = {
  params: Promise<{
    examId: string;
  }>;
};

export default async function TeacherExamResultsPage({
  params,
}: TeacherExamResultsPageProps) {
  await requireTeacherSession("/teacher/exams");
  const { examId } = await params;
  const [exam, results] = await Promise.all([
    getTeacherExam(examId),
    getTeacherExamResults(examId, { page: 1, limit: 50 }),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Exam Results"
        title={`Kết quả của ${exam?.data?.title ?? "exam"}`}
      />
      {results?.data?.length ? (
        <div className="rounded-[1.75rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.data.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.user.fullName}</TableCell>
                  <TableCell>
                    <Badge>{result.score}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(result.submittedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" asChild>
                      <Link href={`/teacher/results/${result.id}/review`}>Review</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          title="Chưa có kết quả"
          description="Kết quả bài thi sẽ xuất hiện ở đây sau khi học viên nộp bài."
        />
      )}
    </div>
  );
}
