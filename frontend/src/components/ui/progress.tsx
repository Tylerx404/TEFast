"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number;
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]",
        className,
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-[hsl(var(--primary))] transition-all"
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  ),
);
Progress.displayName = "Progress";

export { Progress };
