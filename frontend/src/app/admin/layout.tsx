import { PageShell } from "@/components/app/page-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdminSession } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession("/admin");

  return (
    <PageShell className="max-w-7xl">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <AdminSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </PageShell>
  );
}
