"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookCopy,
  ClipboardCheck,
  FolderUp,
  LayoutDashboard,
  LibraryBig,
} from "lucide-react";

import { cn } from "@/lib/utils";

const teacherLinks = [
  {
    href: "/teacher",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/teacher/courses",
    label: "Courses",
    icon: LibraryBig,
  },
  {
    href: "/teacher/exams",
    label: "Exams",
    icon: ClipboardCheck,
  },
  {
    href: "/teacher/vocabulary",
    label: "Vocabulary",
    icon: BookCopy,
  },
  {
    href: "/teacher/uploads",
    label: "Uploads",
    icon: FolderUp,
  },
];

export function TeacherSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-[1.75rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <div className="mb-4 px-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[hsl(var(--primary))]">
          Teacher Area
        </p>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          Quản lý nội dung và theo dõi lớp học của bạn.
        </p>
      </div>
      <nav className="grid gap-2">
        {teacherLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-[1.25rem] px-3 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
