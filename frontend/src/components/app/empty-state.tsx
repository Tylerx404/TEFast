import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
          <AlertCircle className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-7 text-[hsl(var(--muted-foreground))]">
          {description}
        </p>
        {actionHref && actionLabel ? (
          <Button asChild>
            <a href={actionHref}>{actionLabel}</a>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
