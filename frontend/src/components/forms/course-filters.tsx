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

export function CourseFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [isPublished, setIsPublished] = useState(
    searchParams.get("isPublished") ?? "",
  );

  function submitFilters() {
    const params = new URLSearchParams(searchParams.toString());

    if (keyword) {
      params.set("keyword", keyword);
    } else {
      params.delete("keyword");
    }

    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    if (isPublished) {
      params.set("isPublished", isPublished);
    } else {
      params.delete("isPublished");
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
          placeholder="Tìm theo tiêu đề, kỹ năng, từ khóa..."
          className="pl-10"
        />
      </div>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger>
          <SelectValue placeholder="Danh mục" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tất cả</SelectItem>
          <SelectItem value="TOEIC">TOEIC</SelectItem>
          <SelectItem value="IELTS">IELTS</SelectItem>
        </SelectContent>
      </Select>
      <Select value={isPublished} onValueChange={setIsPublished}>
        <SelectTrigger>
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tất cả</SelectItem>
          <SelectItem value="true">Published</SelectItem>
          <SelectItem value="false">Draft</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={submitFilters} disabled={isPending}>
        {isPending ? "Đang lọc..." : "Áp dụng"}
      </Button>
    </div>
  );
}
