import Link from "next/link";

import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <PageShell className="justify-center">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="hidden border-none bg-transparent shadow-none lg:block">
          <CardHeader className="px-0">
            <SectionHeading
              eyebrow="Recover access"
              title="Lay lai quyen truy cap tai khoan bang email reset mat khau"
              description="Backend tao token tam thoi, gui link qua SMTP Brevo va cho phep ban dat lai mat khau an toan."
            />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <SectionHeading
              title="Quen mat khau"
              description="Nhap email da dang ky de nhan link dat lai mat khau."
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <ForgotPasswordForm />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Nho mat khau roi?{" "}
              <Link href="/login" className="font-medium text-[hsl(var(--primary))]">
                Dang nhap
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
