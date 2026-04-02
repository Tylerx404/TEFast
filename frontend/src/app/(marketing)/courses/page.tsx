import { CourseCard } from "@/components/app/course-card";
import { EmptyState } from "@/components/app/empty-state";
import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { CourseFilters } from "@/components/forms/course-filters";
import { getCourses } from "@/features/courses/api";

type CoursesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
  const courses = await getCourses(filters);

  return (
    <PageShell>
      <SectionHeading
        eyebrow="Course Catalog"
        title="Tìm lộ trình TOEIC hoặc IELTS phù hợp với mục tiêu hiện tại"
        description="Dùng bộ lọc để thu hẹp khóa học theo category, từ khóa và trạng thái publish."
      />
      <CourseFilters />
      {courses?.data?.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.data.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Không tìm thấy khóa học phù hợp"
          description="Hãy thay đổi từ khóa hoặc category để thử lại. Nếu backend chưa sẵn sàng, đây cũng là trạng thái fallback an toàn."
        />
      )}
    </PageShell>
  );
}
