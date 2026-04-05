import { SectionHeading } from "@/components/app/section-heading";
import { TeacherVocabularyForm } from "@/components/forms/teacher-vocabulary-form";
import { DeleteResourceButton } from "@/components/teacher/delete-resource-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTeacherVocabularyDetail,
} from "@/features/teacher/vocabulary";
import { requireTeacherSession } from "@/lib/auth/session";

type TeacherEditVocabularyPageProps = {
  params: Promise<{
    vocabularyId: string;
  }>;
};

export default async function TeacherEditVocabularyPage({
  params,
}: TeacherEditVocabularyPageProps) {
  await requireTeacherSession("/teacher/vocabulary");
  const { vocabularyId } = await params;
  const vocabulary = await getTeacherVocabularyDetail(vocabularyId);

  if (!vocabulary?.data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading eyebrow="Edit Vocabulary" title={vocabulary.data.word} />
        <DeleteResourceButton
          label="Vocabulary"
          description="Mục từ này sẽ bị xóa."
          deletePath={`/api/proxy/vocabulary/${vocabularyId}`}
          redirectTo="/teacher/vocabulary"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Vocabulary form</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherVocabularyForm
            mode="edit"
            vocabularyId={vocabularyId}
            initialValues={{
              word: vocabulary.data.word,
              phonetic: vocabulary.data.phonetic ?? "",
              meaning: vocabulary.data.meaning,
              example: vocabulary.data.example ?? "",
              category: vocabulary.data.category ?? "TOEIC",
              topic: vocabulary.data.topic ?? "",
              level: vocabulary.data.level ?? "",
              audioUrl: vocabulary.data.audioUrl ?? "",
              imageUrl: vocabulary.data.imageUrl ?? "",
              isPublished: vocabulary.data.isPublished ? "true" : "false",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
