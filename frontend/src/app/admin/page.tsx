import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { SectionHeading } from "@/components/app/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAdminUsers, getSystemHealth } from "@/features/admin/users";

export default async function AdminDashboardPage() {
  const [users, health] = await Promise.all([
    getAdminUsers({ limit: "1" }),
    getSystemHealth(),
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin Dashboard"
        title="Điều phối hệ thống và quản trị người dùng"
        description="Admin area tập trung vào user management, role assignment và tình trạng hệ thống."
      />

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{users?.meta?.total ?? users?.data?.length ?? 0}</p>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Tổng người dùng theo `GET /users`.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>{health?.data?.status ?? "unknown"}</Badge>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Runtime: {health?.data?.runtime ?? "n/a"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick links</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/admin/users">Mở user management</Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/admin/system">Mở system health</Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/teacher">Đi tới teacher area</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {health?.data ? (
        <Alert>
          <AlertTitle>{health.data.service}</AlertTitle>
          <AlertDescription>
            Timestamp: {health.data.timestamp}. Postgres: {health.data.dependencies.postgres}. Redis:{" "}
            {health.data.dependencies.redis}.
          </AlertDescription>
        </Alert>
      ) : (
        <EmptyState
          title="Chưa lấy được health"
          description="Hiện chưa đọc được trạng thái hệ thống. Hãy thử lại sau."
          actionHref="/admin/system"
          actionLabel="Mở system page"
        />
      )}
    </div>
  );
}
