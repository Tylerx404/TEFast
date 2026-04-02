import { SectionHeading } from "@/components/app/section-heading";
import { TeacherResultReviewForm } from "@/components/forms/teacher-result-review-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTeacherResult } from "@/features/teacher/results";
import { requireTeacherSession } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";

type TeacherReviewResultPageProps = {
  params: Promise<{
    resultId: string;
  }>;
};

export default async function TeacherReviewResultPage({
  params,
}: TeacherReviewResultPageProps) {
  await requireTeacherSession("/teacher/results");
  const { resultId } = await params;
  const result = await getTeacherResult(resultId);

  if (!result?.data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Review Result"
        title={`Review kết quả ${result.data.id}`}
        description={`Bài làm được nộp lúc ${formatDate(result.data.submittedAt)}.`}
      />
      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Score</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>{result.data.score}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Correct</CardTitle>
          </CardHeader>
          <CardContent>{result.data.correctCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Wrong</CardTitle>
          </CardHeader>
          <CardContent>{result.data.wrongCount}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Review form</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherResultReviewForm
            resultId={resultId}
            examId={result.data.examId}
            initialValues={{
              feedback: result.data.feedback ?? "",
              manualScore: result.data.score,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
