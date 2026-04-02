"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { proxyApiFetch, ApiRequestError } from "@/lib/api/client";
import type { ExamSession } from "@/types/domain";

type StartExamButtonProps = {
  examId: string;
  redirectTo: string;
  isAuthenticated: boolean;
};

export function StartExamButton({
  examId,
  redirectTo,
  isAuthenticated,
}: StartExamButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  if (!isAuthenticated) {
    return (
      <Button asChild size="lg">
        <Link href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}>
          Đăng nhập để bắt đầu
        </Link>
      </Button>
    );
  }

  async function handleStart() {
    setIsPending(true);

    try {
      const response = await proxyApiFetch<ExamSession>(`/api/proxy/exams/${examId}/start`, {
        method: "POST",
        body: JSON.stringify({
          device: "web",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      toast.success("Phiên thi đã bắt đầu");
      router.push(
        `/exams/${examId}/take?session=${encodeURIComponent(
          response.data.examSessionId,
        )}&expiresAt=${encodeURIComponent(response.data.expiresAt)}`,
      );
      router.refresh();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Không thể bắt đầu bài thi");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button size="lg" onClick={handleStart} disabled={isPending}>
      {isPending ? "Đang tạo phiên thi..." : "Bắt đầu làm bài"}
    </Button>
  );
}
