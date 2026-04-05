import Link from "next/link";
import { ArrowUpRight, BookOpen, GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CourseDetail, CourseListItem } from "@/types/domain";

type CourseCardProps = {
  course: CourseListItem | CourseDetail;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative min-h-44 bg-[radial-gradient(circle_at_top_left,rgba(194,91,42,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(69,121,111,0.24),transparent_36%),linear-gradient(135deg,#f9f4eb_0%,#efe4d5_100%)] p-6">
        <div className="flex items-start justify-between gap-3">
          <Badge>{course.category}</Badge>
          <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
            {course.level}
          </span>
        </div>
        <div className="mt-10 flex items-center gap-3 text-[hsl(var(--muted-foreground))]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm">Giảng viên</p>
            <p className="font-medium text-[hsl(var(--foreground))]">
              {course.teacher?.fullName ?? "TEFast Academy"}
            </p>
          </div>
        </div>
      </div>
      <CardHeader className="pb-4">
        <CardTitle className="line-clamp-2 text-2xl">{course.title}</CardTitle>
        {"description" in course && course.description ? (
          <p className="line-clamp-3 text-sm leading-7 text-[hsl(var(--muted-foreground))]">
            {course.description}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <BookOpen className="h-4 w-4" />
          <span>{course.isPublished ? "Đã public" : "Bản nháp"}</span>
        </div>
        {"price" in course ? (
          <p className="text-lg font-semibold text-[hsl(var(--foreground))]">
            {formatCurrency(course.price)}
          </p>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full justify-between">
          <Link href={`/courses/${course.slug}`}>
            Xem chi tiết
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
