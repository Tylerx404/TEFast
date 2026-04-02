"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminUserFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [role, setRole] = useState(searchParams.get("role") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());

    if (keyword) {
      params.set("keyword", keyword);
    } else {
      params.delete("keyword");
    }

    if (role) {
      params.set("role", role);
    } else {
      params.delete("role");
    }

    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="grid gap-4 rounded-[1.75rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 md:grid-cols-[1.2fr_0.5fr_0.5fr_auto]">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          className="pl-10"
        />
      </div>
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger>
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tất cả</SelectItem>
          <SelectItem value="STUDENT">STUDENT</SelectItem>
          <SelectItem value="TEACHER">TEACHER</SelectItem>
          <SelectItem value="ADMIN">ADMIN</SelectItem>
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tất cả</SelectItem>
          <SelectItem value="ACTIVE">ACTIVE</SelectItem>
          <SelectItem value="INACTIVE">INACTIVE</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={applyFilters} disabled={isPending}>
        {isPending ? "Đang lọc..." : "Áp dụng"}
      </Button>
    </div>
  );
}
