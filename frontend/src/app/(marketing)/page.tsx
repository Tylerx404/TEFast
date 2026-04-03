import Link from "next/link";
import { ArrowRight, BookOpenText, BrainCircuit, Trophy } from "lucide-react";

import { CourseCard } from "@/components/app/course-card";
import { EmptyState } from "@/components/app/empty-state";
import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCourses } from "@/features/courses/api";

export default async function LandingPage() {
  const featuredCourses = await getCourses({
    limit: "3",
    isPublished: "true",
  });

  return (
    <PageShell className="gap-10">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(247,239,228,0.78))] p-8 shadow-[0_24px_80px_rgba(60,44,24,0.12)] md:p-10">
          <Badge className="w-fit">Student-first frontend</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Học TOEIC và IELTS trong một không gian gọn, rõ và đủ chiều sâu để tiến bộ thật.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">
            TEFast gom course, lesson, practice exam và kết quả vào một luồng học liền mạch.
            Frontend này được dựng để bám sát API contract hiện tại của backend Bun + Express.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/courses">
                Khám phá khóa học
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">Tạo tài khoản</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-white/70 p-4">
              <BookOpenText className="h-5 w-5 text-[hsl(var(--primary))]" />
              <p className="mt-3 font-medium">Course flow rõ ràng</p>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                Từ public catalog tới enrollment và lesson progression.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-white/70 p-4">
              <BrainCircuit className="h-5 w-5 text-[hsl(var(--primary))]" />
              <p className="mt-3 font-medium">Thi thử có timer</p>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                Start exam, điều hướng câu hỏi, nộp bài và xem kết quả.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-white/70 p-4">
              <Trophy className="h-5 w-5 text-[hsl(var(--primary))]" />
              <p className="mt-3 font-medium">Kết quả dễ theo dõi</p>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                Lịch sử điểm số và detail review được đặt đúng ngữ cảnh.
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-[#1d1d1b] text-[#f8f1e5]">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.28em] text-[#f0a27a]">
              Learning Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="w-full justify-start bg-white/10">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
                <TabsTrigger value="ux">UX</TabsTrigger>
              </TabsList>
              <TabsContent value="student" className="space-y-4 text-sm leading-7 text-white/80">
                <p>Browse course → enroll → learn lesson → start exam → submit → review result.</p>
                <p>Điều hướng được giữ thống nhất trong một app thay vì tách portal ngay từ đầu.</p>
              </TabsContent>
              <TabsContent value="api" className="space-y-4 text-sm leading-7 text-white/80">
                <p>Frontend đọc public data bằng server component và gọi mutation qua proxy nội bộ để giữ JWT trong `httpOnly` cookie.</p>
                <p>Cách này giảm lộ token và phù hợp với backend đang expose bearer auth.</p>
              </TabsContent>
              <TabsContent value="ux" className="space-y-4 text-sm leading-7 text-white/80">
                <p>Loading, empty, error state được chuẩn hóa để backend chưa xong vẫn có trải nghiệm rõ ràng.</p>
                <p>Tông màu ấm hiện tại được giữ nguyên và map vào token của `shadcn/ui`.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Featured Courses"
          title="Khóa học nổi bật đang chờ bạn bắt đầu"
          description="Danh sách này đang lấy theo API contract `GET /courses`. Khi backend chưa expose đầy đủ, frontend sẽ hiển thị trạng thái thay thế thay vì vỡ trang."
        />
        {featuredCourses?.data?.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredCourses.data.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Chưa có khóa học public"
            description="Khi backend hoàn thiện `GET /courses`, phần này sẽ tự hiển thị danh sách khóa học nổi bật."
            actionHref="/courses"
            actionLabel="Đi tới catalog"
          />
        )}
      </section>
    </PageShell>
  );
}
