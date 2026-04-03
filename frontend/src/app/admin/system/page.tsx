import { EmptyState } from "@/components/app/empty-state";
import { SectionHeading } from "@/components/app/section-heading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSystemHealth } from "@/features/admin/users";

export default async function AdminSystemPage() {
  const health = await getSystemHealth();

  if (!health?.data) {
    return (
      <EmptyState
        title="Không lấy được system health"
        description="Kiểm tra endpoint `/health` hoặc thử lại sau."
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="System"
        title="Tình trạng hệ thống"
        description="Dữ liệu đang lấy trực tiếp từ `GET /health`."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Service</CardTitle>
          </CardHeader>
          <CardContent>{health.data.service}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>{health.data.status}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Runtime</CardTitle>
          </CardHeader>
          <CardContent>{health.data.runtime}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Timestamp</CardTitle>
          </CardHeader>
          <CardContent>{health.data.timestamp}</CardContent>
        </Card>
      </div>

      <Alert>
        <AlertTitle>Dependencies</AlertTitle>
        <AlertDescription>
          Postgres: {health.data.dependencies.postgres}. Redis: {health.data.dependencies.redis}.
        </AlertDescription>
      </Alert>
    </div>
  );
}
