import Link from "next/link";

import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { ResendVerificationForm } from "@/components/forms/resend-verification-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type ResendVerificationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResendVerificationPage({
  searchParams,
}: ResendVerificationPageProps) {
  const params = await searchParams;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;

  return (
    <PageShell className="justify-center">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="hidden border-none bg-transparent shadow-none lg:block">
          <CardHeader className="px-0">
            <SectionHeading
              eyebrow="Need a new link?"
              title="Gui lai email xac thuc de kich hoat tai khoan"
              description="Neu ban chua nhan duoc thu hoac link cu da het han, he thong se tao mot link xac thuc moi."
            />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <SectionHeading
              title="Resend verification email"
              description="Nhap email dang ky de nhan lai lien ket kich hoat tai khoan."
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <ResendVerificationForm initialEmail={email} />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Da xac thuc xong?{" "}
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
