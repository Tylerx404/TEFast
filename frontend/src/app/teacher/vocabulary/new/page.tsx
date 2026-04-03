import { SectionHeading } from "@/components/app/section-heading";
import { TeacherVocabularyForm } from "@/components/forms/teacher-vocabulary-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTeacherSession } from "@/lib/auth/session";

export default async function TeacherNewVocabularyPage() {
  await requireTeacherSession("/teacher/vocabulary");

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Create Vocabulary" title="Tạo mục từ mới" />
      <Card>
        <CardHeader>
          <CardTitle>Vocabulary form</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherVocabularyForm
            mode="create"
            initialValues={{
              word: "",
              phonetic: "",
              meaning: "",
              example: "",
              category: "TOEIC",
              topic: "",
              level: "BEGINNER",
              audioUrl: "",
              imageUrl: "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
