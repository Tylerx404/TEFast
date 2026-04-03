"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { reviewTeacherResult } from "@/features/teacher/results.client";
import { teacherResultReviewSchema } from "@/features/teacher/schemas";
import { ApiRequestError } from "@/lib/api/client";
import { mapApiErrorToForm } from "@/lib/forms/map-api-error-to-form";
import type { TeacherResultReviewFormValues } from "@/types/forms";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TeacherResultReviewForm({
  resultId,
  examId,
  initialValues,
}: {
  resultId: string;
  examId: string;
  initialValues: TeacherResultReviewFormValues;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<TeacherResultReviewFormValues>({
    resolver: zodResolver(teacherResultReviewSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: TeacherResultReviewFormValues) {
    setIsPending(true);

    try {
      await reviewTeacherResult(resultId, values);
      toast.success("Đã review kết quả");
      router.push(`/teacher/exams/${examId}/results`);
      router.refresh();
    } catch (error) {
      mapApiErrorToForm(error, form.setError);

      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Không thể review kết quả");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="manualScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manual score</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Đang lưu..." : "Lưu review"}
        </Button>
      </form>
    </Form>
  );
}
