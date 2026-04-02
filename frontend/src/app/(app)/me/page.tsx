import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { ProfileForm } from "@/components/forms/profile-form";
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
      <Card className="max-w-3xl">
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
    </PageShell>
  );
}
