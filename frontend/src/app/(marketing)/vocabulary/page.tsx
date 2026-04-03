import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVocabulary } from "@/features/vocabulary/api";

type VocabularyPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VocabularyPage({ searchParams }: VocabularyPageProps) {
  const params = await searchParams;
  const filters = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const vocabulary = await getVocabulary(filters);

  return (
    <PageShell>
      <SectionHeading
        eyebrow="Vocabulary"
        title="Kho từ vựng theo topic và cấp độ"
        description="Tra cứu từ vựng theo chủ đề và cấp độ để hỗ trợ quá trình học TOEIC và IELTS."
      />
      {vocabulary?.data?.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {vocabulary.data.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  {item.category ? <Badge>{item.category}</Badge> : null}
                  {item.level ? <Badge variant="secondary">{item.level}</Badge> : null}
                </div>
                <CardTitle className="mt-4 text-2xl">{item.word}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[hsl(var(--muted-foreground))]">{item.meaning}</p>
                <Link href={`/vocabulary/${item.id}`} className="font-medium text-[hsl(var(--primary))]">
                  Xem chi tiết
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Vocabulary chưa có dữ liệu"
          description="Hiện chưa có mục từ nào phù hợp để hiển thị."
        />
      )}
    </PageShell>
  );
}
