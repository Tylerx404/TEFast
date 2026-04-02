import { SectionHeading } from "@/components/app/section-heading";
import { TeacherCourseForm } from "@/components/forms/teacher-course-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherNewCoursePage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Create Course"
        title="Tạo khóa học mới"
        description="Teacher hoặc admin có thể tạo khóa học TOEIC/IELTS từ màn hình này."
      />
      <Card>
        <CardHeader>
          <CardTitle>Course form</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherCourseForm
            mode="create"
            initialValues={{
              title: "",
              slug: "",
              description: "",
              category: "IELTS",
              level: "BEGINNER",
              price: 0,
              thumbnailUrl: "",
              isPublished: "false",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
