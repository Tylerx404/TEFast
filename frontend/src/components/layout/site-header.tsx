import Link from "next/link";
import { BookMarked, Menu, Sparkles, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserNav } from "@/components/layout/user-nav";
import { isTeacherRole } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/domain";

const publicLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/vocabulary", label: "Vocabulary" },
];

const appLinks = [
  { href: "/my-courses", label: "My Courses" },
  { href: "/results", label: "Results" },
  { href: "/me", label: "Profile" },
];

export function SiteHeader({ session }: { session: SessionUser | null }) {
  const roleLinks = isTeacherRole(session)
    ? [{ href: "/teacher", label: "Teacher" }]
    : [];
  const links = session
    ? [...publicLinks, ...appLinks, ...roleLinks]
    : publicLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/90 backdrop-blur">
      <div className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[hsl(var(--primary))]">
                TEFast
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                TOEIC & IELTS study hub
              </p>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <UserNav user={session} />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Bắt đầu học</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]",
              "md:hidden",
            )}
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col gap-6">
            <SheetHeader>
              <SheetTitle>Điều hướng</SheetTitle>
              <SheetDescription>
                Truy cập nhanh các khu vực chính của TEFast.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-2">
              {links.map((link) => (
                <Button key={link.href} variant="ghost" className="justify-start" asChild>
                  <Link href={link.href}>
                    <BookMarked className="h-4 w-4" />
                    {link.label}
                  </Link>
                </Button>
              ))}
            </div>
            <div className="mt-auto grid gap-2">
              {session ? (
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/me">
                    <UserRound className="h-4 w-4" />
                    {session.fullName}
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Bắt đầu học</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
