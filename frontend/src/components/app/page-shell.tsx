import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 md:px-6 md:py-10", className)}>
      {children}
    </main>
  );
}
