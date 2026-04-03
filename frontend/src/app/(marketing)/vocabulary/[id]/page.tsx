import { EmptyState } from "@/components/app/empty-state";
import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVocabularyDetail } from "@/features/vocabulary/api";

type VocabularyDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VocabularyDetailPage({
  params,
}: VocabularyDetailPageProps) {
  const { id } = await params;
  const vocabulary = await getVocabularyDetail(id);

  if (!vocabulary?.data) {
    return (
      <PageShell>
        <EmptyState
          title="Không tải được mục từ"
          description="Kiểm tra endpoint `GET /vocabulary/:id` hoặc quay lại danh sách từ vựng."
          actionHref="/vocabulary"
          actionLabel="Quay lại vocabulary"
        />
      </PageShell>
    );
  }

  return (
    <PageShell className="max-w-4xl">
      <SectionHeading
        eyebrow="Vocabulary Detail"
        title={vocabulary.data.word}
        description={vocabulary.data.meaning}
      />
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            {vocabulary.data.category ? <Badge>{vocabulary.data.category}</Badge> : null}
            {vocabulary.data.topic ? <Badge variant="secondary">{vocabulary.data.topic}</Badge> : null}
            {vocabulary.data.level ? <Badge variant="outline">{vocabulary.data.level}</Badge> : null}
          </div>
          <CardTitle className="mt-4">{vocabulary.data.phonetic || "Phiên âm đang cập nhật"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="leading-7 text-[hsl(var(--muted-foreground))]">
            {vocabulary.data.example || "Chưa có ví dụ sử dụng cho từ này."}
          </p>
          {vocabulary.data.audioUrl ? (
            <audio controls className="w-full">
              <source src={vocabulary.data.audioUrl} />
            </audio>
          ) : null}
        </CardContent>
      </Card>
    </PageShell>
  );
}
