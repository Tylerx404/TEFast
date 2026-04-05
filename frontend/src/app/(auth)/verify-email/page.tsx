import Link from "next/link";

import { PageShell } from "@/components/app/page-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { apiFetch, ApiRequestError } from "@/lib/api/client";
import { appConfig } from "@/lib/config";

type VerifyEmailPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  let title = "Verification link is invalid";
  let description = "The verification token is missing or invalid. Please register again or request a new link later.";
  let actionHref = "/register";
  let actionLabel = "Back to register";
  let secondaryActionHref = "/resend-verification";
  let secondaryActionLabel = "Resend verification email";

  if (token) {
    try {
      const response = await apiFetch<null>(
        `/auth/verify-email?token=${encodeURIComponent(token)}`,
        {
          cache: "no-store",
        },
        {
          baseUrl: appConfig.apiBaseUrl,
        },
      );

      title = "Email verified";
      description = response.message || "Your account is ready. You can log in now.";
      actionHref = "/login";
      actionLabel = "Continue to login";
      secondaryActionHref = "/forgot-password";
      secondaryActionLabel = "Forgot password?";
    } catch (error) {
      if (error instanceof ApiRequestError) {
        title = error.status === 403 ? "This account cannot be verified" : "Verification failed";
        description = error.message;
      } else {
        throw error;
      }
    }
  }

  return (
    <PageShell className="justify-center">
      <div className="mx-auto w-full max-w-3xl">
        <Card>
          <CardHeader>
            <SectionHeading
              eyebrow="Email verification"
              title={title}
              description={description}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href={actionHref} className="inline-flex text-sm font-medium text-[hsl(var(--primary))]">
              {actionLabel}
            </Link>
            <Link href={secondaryActionHref} className="inline-flex text-sm font-medium text-[hsl(var(--primary))]">
              {secondaryActionLabel}
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
