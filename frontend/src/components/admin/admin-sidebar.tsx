"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldCheck, UsersRound } from "lucide-react";

import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: UsersRound },
  { href: "/admin/system", label: "System", icon: ShieldCheck },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-[1.75rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <div className="mb-4 px-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[hsl(var(--primary))]">
          Admin Area
        </p>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          Quản lý người dùng, role và quan sát trạng thái hệ thống.
        </p>
      </div>
      <nav className="grid gap-2">
        {adminLinks.map((link) => {
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
