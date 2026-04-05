import Link from "next/link";

import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  return (
    <PageShell className="justify-center">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="hidden border-none bg-transparent shadow-none lg:block">
          <CardHeader className="px-0">
            <SectionHeading
              eyebrow="New password"
              title="Dat lai mat khau bang lien ket duoc gui tu email"
              description="Lien ket reset chi hop le trong mot khoang thoi gian ngan de han che rui ro lo token."
            />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <SectionHeading
              title="Dat lai mat khau"
              description="Nhap mat khau moi cho tai khoan cua ban."
            />
          </CardHeader>
          <CardContent className="space-y-6">
            {token ? (
              <ResetPasswordForm token={token} />
            ) : (
              <div className="space-y-4 text-sm text-[hsl(var(--muted-foreground))]">
                <p>Link reset khong hop le hoac thieu token.</p>
                <Link href="/forgot-password" className="font-medium text-[hsl(var(--primary))]">
                  Yeu cau link moi
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
