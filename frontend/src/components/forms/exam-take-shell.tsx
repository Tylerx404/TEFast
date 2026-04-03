"use client";

import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, Flag, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { proxyApiFetch, ApiRequestError } from "@/lib/api/client";
import type { ExamAnswerPayload, QuestionItem } from "@/types/domain";

type ExamTakeShellProps = {
  examId: string;
  examSessionId: string;
  expiresAt: string;
  questions: QuestionItem[];
};

export function ExamTakeShell({
  examId,
  examSessionId,
  expiresAt,
  questions,
}: ExamTakeShellProps) {
  const router = useRouter();
  const [startedAt] = useState(() => Date.now());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const deadline = new Date(expiresAt).getTime();
    return Math.max(0, Math.floor((deadline - Date.now()) / 1000));
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const currentQuestion = questions[currentIndex];
  const answeredCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  );
  const submitOnTimeout = useEffectEvent(() => {
    void handleSubmit();
  });

  useEffect(() => {
    if (secondsLeft !== 0) {
      return;
    }

    submitOnTimeout();
  }, [secondsLeft]);

  function updateAnswer(questionId: string, selectedAnswer: string) {
    setAnswers((current) => ({
      ...current,
      [questionId]: selectedAnswer,
    }));
  }

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const payload = Object.entries(answers)
      .filter(([, selectedAnswer]) => Boolean(selectedAnswer))
      .map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
      })) satisfies ExamAnswerPayload[];

    try {
      const durationSpentSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
      const response = await proxyApiFetch<{ id: string }>(
        "/api/proxy/exam-results",
        {
          method: "POST",
          body: JSON.stringify({
            examSessionId,
            examId,
            answers: payload,
            durationSpentSeconds,
          }),
        },
      );

      toast.success("Đã nộp bài thành công");
      router.push(`/results/${response.data.id}`);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Không thể nộp bài");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.35fr_0.65fr]">
      <aside className="space-y-4 rounded-[1.75rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Thời gian còn lại
            </p>
            <div className="flex items-center gap-2 rounded-full bg-[hsl(var(--muted))] px-3 py-1 text-sm font-medium">
              <Clock3 className="h-4 w-4" />
              {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
            </div>
          </div>
          <Progress value={(answeredCount / Math.max(questions.length, 1)) * 100} />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Đã trả lời {answeredCount}/{questions.length} câu.
          </p>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => {
            const isAnswered = Boolean(answers[question.id]);
            const isActive = currentIndex === index;

            return (
              <button
                key={question.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : isAnswered
                      ? "border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full" variant="destructive">
              <Flag className="h-4 w-4" />
              Nộp bài
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận nộp bài</DialogTitle>
              <DialogDescription>
                Bạn đã trả lời {answeredCount}/{questions.length} câu. Sau khi nộp sẽ
                không thể thay đổi đáp án của bài làm này.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">Tiếp tục làm</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Đang nộp...
                  </>
                ) : (
                  "Xác nhận nộp"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </aside>

      <section className="rounded-[1.75rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--primary))]">
            {currentQuestion.section} • Câu {currentIndex + 1}
          </p>
          <h2 className="text-2xl font-semibold">{currentQuestion.content}</h2>
          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => {
              const optionLabel = String.fromCharCode(65 + index);
              const selected = answers[currentQuestion.id] === option;

              return (
                <button
                  key={`${currentQuestion.id}-${option}`}
                  type="button"
                  onClick={() => updateAnswer(currentQuestion.id, option)}
                  className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
                    selected
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-xs font-semibold">
                      {optionLabel}
                    </span>
                    <span className="leading-7">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
