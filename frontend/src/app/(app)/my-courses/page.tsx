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
        title="Các khóa học bạn đang theo"
        description="Theo dõi tiến độ và quay lại bài học dang dở chỉ với một lần nhấp."
      />
      {enrollments?.data?.length ? (
        <div className="grid gap-5">
          {enrollments.data.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.courseTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[hsl(var(--muted-foreground))]">Tiến độ</span>
                    <span className="font-medium">{item.progressPercent}%</span>
                  </div>
                  <Progress value={item.progressPercent} />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={`/courses/${item.courseId}`}>Xem chi tiết khóa học</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link
                      href={
                        item.lastLessonId
                          ? `/learn/${item.courseId}/lessons/${item.lastLessonId}`
                          : `/courses/${item.courseId}`
                      }
                    >
                      Tiếp tục học
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Bạn chưa đăng ký khóa học nào"
          description="Hãy bắt đầu từ course catalog để enroll một lộ trình TOEIC hoặc IELTS."
          actionHref="/courses"
          actionLabel="Khám phá courses"
        />
      )}
    </PageShell>
  );
}
