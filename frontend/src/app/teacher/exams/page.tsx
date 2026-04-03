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
import { getTeacherExams } from "@/features/teacher/exams";
import { requireTeacherSession } from "@/lib/auth/session";

export default async function TeacherExamsPage() {
  const session = await requireTeacherSession("/teacher/exams");
  const exams = await getTeacherExams(session, { limit: 100 });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Teacher Exams"
          title="Quản lý đề thi"
          description="Danh sách đề thi thuộc teacher area."
        />
        <Button asChild>
          <Link href="/teacher/exams/new">Tạo exam</Link>
        </Button>
      </div>
      {exams?.data?.length ? (
        <div className="rounded-[1.75rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.data.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>
                    <Badge>{exam.category}</Badge>
                  </TableCell>
                  <TableCell>{exam.examType}</TableCell>
                  <TableCell>{exam.durationMinutes} phút</TableCell>
                  <TableCell>
                    <Badge variant={exam.isPublished ? "default" : "secondary"}>
                      {exam.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" asChild>
                      <Link href={`/teacher/exams/${exam.id}`}>Quản lý</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          title="Chưa có exam"
          description="Hãy tạo exam đầu tiên để bắt đầu question bank."
          actionHref="/teacher/exams/new"
          actionLabel="Tạo exam"
        />
      )}
    </div>
  );
}
