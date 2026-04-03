"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { proxyApiFetch, ApiRequestError } from "@/lib/api/client";

type EnrollCourseButtonProps = {
  courseId: string;
  isAuthenticated: boolean;
  isEnrolled: boolean;
  redirectTo: string;
};

export function EnrollCourseButton({
  courseId,
  isAuthenticated,
  isEnrolled,
  redirectTo,
}: EnrollCourseButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  if (!isAuthenticated) {
    return (
      <Button asChild size="lg">
        <Link href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}>
          Đăng nhập để đăng ký
        </Link>
      </Button>
    );
  }

  if (isEnrolled) {
    return (
      <Button asChild size="lg">
        <Link href="/my-courses">Tiếp tục học</Link>
      </Button>
    );
  }

  async function handleEnroll() {
    setIsPending(true);

    try {
      await proxyApiFetch("/api/proxy/enrollments", {
        method: "POST",
        body: JSON.stringify({ courseId }),
      });

      toast.success("Đăng ký khóa học thành công");
      router.push("/my-courses");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Không thể đăng ký khóa học");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button size="lg" onClick={handleEnroll} disabled={isPending}>
      {isPending ? "Đang xử lý..." : "Đăng ký khóa học"}
    </Button>
  );
}
