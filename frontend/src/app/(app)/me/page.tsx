import Link from "next/link";

import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { ProfileForm } from "@/components/forms/profile-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { safeServerApiFetch } from "@/lib/api/server";
import { requireSession } from "@/lib/auth/session";
import type { UserProfile } from "@/types/domain";

export default async function ProfilePage() {
  await requireSession("/me");
  const profile = await safeServerApiFetch<UserProfile>("/users/profile", undefined, {
    auth: true,
  });

  return (
    <PageShell>
      <SectionHeading
        eyebrow="My Profile"
        title="Thông tin cá nhân"
        description="Cập nhật hồ sơ và mục tiêu thi của bạn để cá nhân hóa trải nghiệm học."
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa hồ sơ</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              initialValues={{
                fullName: profile?.data?.fullName ?? "",
                phone: profile?.data?.phone ?? "",
                avatarUrl: profile?.data?.avatarUrl ?? "",
                targetExam: profile?.data?.targetExam ?? "",
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Xác thực email</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Trạng thái</p>
                <Badge variant={profile?.data?.status?.toUpperCase() === "ACTIVE" ? "secondary" : "default"}>
                  {profile?.data?.status?.toUpperCase() === "ACTIVE" ? "Đã xác thực" : "Chưa xác thực"}
                </Badge>
              </div>
              <div className="text-right text-sm text-[hsl(var(--muted-foreground))]">
                <p>Email</p>
                <p className="font-medium text-[hsl(var(--foreground))]">{profile?.data?.email ?? ""}</p>
              </div>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {profile?.data?.status?.toUpperCase() === "ACTIVE"
                ? "Email đã được xác thực. Bạn vẫn có thể yêu cầu gửi lại link nếu cần kiểm tra lại hộp thư."
                : "Email chưa được xác thực. Bạn có thể gửi lại link xác thực để hoàn tất bước này bất cứ lúc nào."}
            </p>
            {profile?.data?.status?.toUpperCase() === "ACTIVE" ? null : (
              <Button asChild className="w-full">
                <Link href={`/resend-verification?email=${encodeURIComponent(profile?.data?.email ?? "")}`}>
                  Gửi lại email xác thực
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
