import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getMyEnrollments } from "@/features/enrollments/api";
import { requireSession } from "@/lib/auth/session";

export default async function MyCoursesPage() {
  await requireSession("/my-courses");
  const enrollments = await getMyEnrollments({
    limit: "20",
    status: "ACTIVE",
  });

  return (
    <PageShell>
      <SectionHeading
        eyebrow="My Courses"
        title="Cac khoa hoc ban dang theo"
        description="Theo doi tien do va quay lai bai hoc dang do chi voi mot lan nhap."
      />
      {enrollments?.data?.length ? (
        <div className="grid gap-5">
          {enrollments.data.map((item) => {
            const courseDetailHref = `/courses/${item.courseSlug ?? item.courseId}`;

            return (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.courseTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[hsl(var(--muted-foreground))]">Tien do</span>
                      <span className="font-medium">{item.progressPercent}%</span>
                    </div>
                    <Progress value={item.progressPercent} />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href={courseDetailHref}>Xem chi tiet khoa hoc</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link
                        href={
                          item.lastLessonOrderIndex
                            ? `/learn/${item.courseSlug ?? item.courseId}/lessons/${item.lastLessonOrderIndex}`
                            : courseDetailHref
                        }
                      >
                        Tiep tuc hoc
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Ban chua dang ky khoa hoc nao"
          description="Hay bat dau tu course catalog de enroll mot lo trinh TOEIC hoac IELTS."
          actionHref="/courses"
          actionLabel="Kham pha courses"
        />
      )}
    </PageShell>
  );
}
