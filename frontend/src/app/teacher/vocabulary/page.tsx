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
import { DeleteResourceButton } from "@/components/teacher/delete-resource-button";
import {
  deleteTeacherVocabulary,
  getTeacherVocabulary,
} from "@/features/teacher/vocabulary";
import { requireTeacherSession } from "@/lib/auth/session";

type TeacherVocabularyPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TeacherVocabularyPage({
  searchParams,
}: TeacherVocabularyPageProps) {
  await requireTeacherSession("/teacher/vocabulary");
  const params = await searchParams;
  const filters = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const vocabulary = await getTeacherVocabulary(filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Teacher Vocabulary"
          title="Quản lý từ vựng"
        />
        <Button asChild>
          <Link href="/teacher/vocabulary/new">Tạo từ vựng</Link>
        </Button>
      </div>
      {vocabulary?.data?.length ? (
        <div className="rounded-[1.75rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Word</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vocabulary.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.word}</TableCell>
                  <TableCell>
                    {item.category ? <Badge>{item.category}</Badge> : "-"}
                  </TableCell>
                  <TableCell>{item.topic || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={item.isPublished ? "default" : "secondary"}>
                      {item.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/teacher/vocabulary/${item.id}/edit`}>Edit</Link>
                      </Button>
                      <DeleteResourceButton
                        label="Vocabulary"
                        description="Mục từ này sẽ bị xóa khỏi kho từ vựng."
                        onDelete={() => deleteTeacherVocabulary(item.id)}
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
          title="Chưa có từ vựng"
          description="Tạo mục từ đầu tiên để bắt đầu kho vocabulary."
          actionHref="/teacher/vocabulary/new"
          actionLabel="Tạo từ vựng"
        />
      )}
    </div>
  );
}
