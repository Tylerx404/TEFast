"use client";

import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { proxyApiFetch } from "@/lib/api/client";
import { getInitials } from "@/lib/utils";
import type { SessionUser } from "@/types/domain";

export function UserNav({ user }: { user: SessionUser }) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await proxyApiFetch("/api/auth/logout", {
        method: "POST",
      });
      toast.success("Đã đăng xuất");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Không thể đăng xuất lúc này");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]">
        <Avatar className="h-11 w-11 border border-[hsl(var(--border))]">
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
          <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2">
          <p className="font-medium">{user.fullName}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {user.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/me">
            <UserRound className="mr-2 h-4 w-4" />
            Hồ sơ
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
