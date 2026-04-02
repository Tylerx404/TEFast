"use client";

import { useMemo, useState } from "react";
import { MessageCircleReply } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { proxyApiFetch, ApiRequestError } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import type { CommentItem, SessionUser } from "@/types/domain";

type CommentThreadProps = {
  comments: CommentItem[];
  session: SessionUser | null;
  courseId: string;
  lessonId: string;
};

type ThreadNode = CommentItem & {
  replies: CommentItem[];
};

export function CommentThread({
  comments,
  session,
  courseId,
  lessonId,
}: CommentThreadProps) {
  const [isPending, setIsPending] = useState(false);
  const [content, setContent] = useState("");
  const [replyTarget, setReplyTarget] = useState<CommentItem | null>(null);

  const thread = useMemo(() => {
    const roots = comments.filter((comment) => !comment.parentCommentId);
    return roots.map((comment) => ({
      ...comment,
      replies: comments.filter((item) => item.parentCommentId === comment.id),
    })) satisfies ThreadNode[];
  }, [comments]);

  async function submitComment() {
    if (!content.trim()) {
      return;
    }

    if (!session) {
      toast.error("Bạn cần đăng nhập để bình luận");
      return;
    }

    setIsPending(true);

    try {
      await proxyApiFetch("/api/proxy/comments", {
        method: "POST",
        body: JSON.stringify({
          courseId,
          lessonId,
          parentCommentId: replyTarget?.id ?? null,
          content,
        }),
      });

      toast.success("Đã gửi bình luận");
      window.location.reload();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Không thể gửi bình luận");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--background))]/70 p-4">
        {replyTarget ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Đang trả lời <span className="font-medium">{replyTarget.user?.fullName}</span>
          </p>
        ) : null}
        <Textarea
          placeholder={
            session
              ? "Viết nhận xét hoặc câu hỏi về bài học..."
              : "Đăng nhập để tham gia thảo luận"
          }
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={!session || isPending}
        />
        <div className="flex flex-wrap gap-3">
          {replyTarget ? (
            <Button variant="outline" onClick={() => setReplyTarget(null)} disabled={isPending}>
              Hủy trả lời
            </Button>
          ) : null}
          <Button onClick={submitComment} disabled={!session || isPending}>
            {isPending ? "Đang gửi..." : "Gửi bình luận"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {thread.map((comment) => (
          <div
            key={comment.id}
            className="space-y-3 rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{comment.user?.fullName ?? "Học viên"}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {formatDate(comment.createdAt)}
                </p>
              </div>
              {session ? (
                <Button variant="ghost" size="sm" onClick={() => setReplyTarget(comment)}>
                  <MessageCircleReply className="h-4 w-4" />
                  Trả lời
                </Button>
              ) : null}
            </div>
            <p className="leading-7 text-[hsl(var(--muted-foreground))]">
              {comment.content}
            </p>

            {comment.replies.length ? (
              <div className="space-y-3 border-l border-[hsl(var(--border))] pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="rounded-[1.25rem] bg-[hsl(var(--muted))]/35 p-4">
                    <p className="font-medium">{reply.user?.fullName ?? "Học viên"}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {formatDate(reply.createdAt)}
                    </p>
                    <p className="mt-2 leading-7 text-[hsl(var(--muted-foreground))]">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
