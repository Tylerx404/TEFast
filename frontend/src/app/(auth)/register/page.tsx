import Link from "next/link";

import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { RegisterForm } from "@/components/forms/register-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <PageShell className="justify-center">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="hidden border-none bg-transparent shadow-none lg:block">
          <CardHeader className="px-0">
            <SectionHeading
              eyebrow="Create account"
              title="Bắt đầu hành trình TOEIC hoặc IELTS với một tài khoản duy nhất"
              description="Frontend sẽ nhận access token sau khi đăng ký thành công và set cookie ở lớp route handler nội bộ."
            />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <SectionHeading
              title="Tạo tài khoản"
              description="Điền thông tin cơ bản để bắt đầu."
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <RegisterForm />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-medium text-[hsl(var(--primary))]">
                Đăng nhập
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
