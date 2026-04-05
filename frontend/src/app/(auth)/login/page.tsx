import Link from "next/link";
import { redirect } from "next/navigation";

import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { LoginForm } from "@/components/forms/login-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function sanitizeRedirectTo(value: string | string[] | undefined) {
  const resolvedValue = Array.isArray(value) ? value[0] : value;

  if (
    typeof resolvedValue !== "string" ||
    !resolvedValue.startsWith("/") ||
    resolvedValue.startsWith("//")
  ) {
    return undefined;
  }

  return resolvedValue;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = sanitizeRedirectTo(params.redirectTo);

  if (params.email !== undefined || params.password !== undefined) {
    redirect(
      redirectTo
        ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
        : "/login",
    );
  }

  return (
    <PageShell className="justify-center">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="hidden border-none bg-transparent shadow-none lg:block">
          <CardHeader className="px-0">
            <SectionHeading
              eyebrow="Welcome back"
              title="Dang nhap de tiep tuc lo trinh hoc dang do"
              description="JWT duoc giu trong httpOnly cookie de client khong phai luu token vao localStorage."
            />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <SectionHeading
              title="Dang nhap"
              description="Dung email va mat khau da dang ky de tiep tuc hoc tap."
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <LoginForm redirectTo={redirectTo} />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Quen mat khau?{" "}
              <Link href="/forgot-password" className="font-medium text-[hsl(var(--primary))]">
                Dat lai tai day
              </Link>
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Muon xac thuc email sau?{" "}
              <Link href="/resend-verification" className="font-medium text-[hsl(var(--primary))]">
                Gui lai tai day
              </Link>
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Chua co tai khoan?{" "}
              <Link href="/register" className="font-medium text-[hsl(var(--primary))]">
                Dang ky ngay
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
