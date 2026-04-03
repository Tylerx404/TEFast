import Link from "next/link";

import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { LoginForm } from "@/components/forms/login-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = Array.isArray(params.redirectTo)
    ? params.redirectTo[0]
    : params.redirectTo;

  return (
    <PageShell className="justify-center">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="hidden border-none bg-transparent shadow-none lg:block">
          <CardHeader className="px-0">
            <SectionHeading
              eyebrow="Welcome back"
              title="Đăng nhập để tiếp tục lộ trình học đang dang dở"
              description="JWT được giữ trong `httpOnly` cookie để client không phải lưu token vào `localStorage`."
            />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <SectionHeading
              title="Đăng nhập"
              description="Dùng email và mật khẩu đã đăng ký."
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <LoginForm redirectTo={redirectTo} />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="font-medium text-[hsl(var(--primary))]">
                Đăng ký ngay
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
