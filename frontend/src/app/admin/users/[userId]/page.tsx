import { EmptyState } from "@/components/app/empty-state";
import { SectionHeading } from "@/components/app/section-heading";
import { AdminRoleForm } from "@/components/forms/admin-role-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminUser } from "@/features/admin/users";
import { formatDate } from "@/lib/utils";

type AdminUserDetailPageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { userId } = await params;
  const user = await getAdminUser(userId);

  if (!user?.data) {
    return (
      <EmptyState
        title="Không tải được user"
        description="Người dùng này hiện không khả dụng hoặc đã bị gỡ khỏi hệ thống."
        actionHref="/admin/users"
        actionLabel="Quay lại users"
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="User Detail"
        title={user.data.fullName}
        description={user.data.email}
      />

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Role</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>{user.data.role}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{user.data.status}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Phone</CardTitle>
          </CardHeader>
          <CardContent>{user.data.phone || "N/A"}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.55fr_0.45fr]">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin hệ thống</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[hsl(var(--muted-foreground))]">User ID</span>
              <span className="font-medium">{user.data.id}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[hsl(var(--muted-foreground))]">Created</span>
              <span className="font-medium">{formatDate(user.data.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[hsl(var(--muted-foreground))]">Updated</span>
              <span className="font-medium">{formatDate(user.data.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cập nhật role</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminRoleForm
              userId={userId}
              initialValues={{
                role:
                  user.data.role === "ADMIN" ||
                  user.data.role === "TEACHER" ||
                  user.data.role === "STUDENT"
                    ? user.data.role
                    : "STUDENT",
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
