import { TeacherSidebar } from "@/components/teacher/teacher-sidebar";
import { PageShell } from "@/components/app/page-shell";
import { requireTeacherSession } from "@/lib/auth/session";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireTeacherSession("/teacher");

  return (
    <PageShell className="max-w-7xl">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <TeacherSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </PageShell>
  );
}
