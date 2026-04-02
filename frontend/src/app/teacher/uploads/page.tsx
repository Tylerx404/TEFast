import { SectionHeading } from "@/components/app/section-heading";
import { TeacherUploadPanel } from "@/components/forms/teacher-upload-panel";
import { requireTeacherSession } from "@/lib/auth/session";

export default async function TeacherUploadsPage() {
  await requireTeacherSession("/teacher/uploads");

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Upload Utility"
        title="Upload asset cho teacher area"
        description="Upload ảnh, audio hoặc tài liệu rồi copy URL sang form course, lesson, question hoặc vocabulary."
      />
      <TeacherUploadPanel />
    </div>
  );
}
