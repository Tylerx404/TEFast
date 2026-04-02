"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  createTeacherQuestion,
  updateTeacherQuestion,
} from "@/features/teacher/questions";
import { teacherQuestionSchema } from "@/features/teacher/schemas";
import { ApiRequestError } from "@/lib/api/client";
import { mapApiErrorToForm } from "@/lib/forms/map-api-error-to-form";
import type { TeacherQuestionFormValues } from "@/types/forms";
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

type TeacherQuestionFormProps = {
  mode: "create" | "edit";
  examId: string;
  questionId?: string;
  initialValues: TeacherQuestionFormValues;
};

export function TeacherQuestionForm({
  mode,
  examId,
  questionId,
  initialValues,
}: TeacherQuestionFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<TeacherQuestionFormValues>({
    resolver: zodResolver(teacherQuestionSchema),
    defaultValues: initialValues,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  async function onSubmit(values: TeacherQuestionFormValues) {
    setIsPending(true);

    const payload = {
      ...values,
      options: values.options
        .map((option) => option.value.trim())
        .filter(Boolean),
    };

    try {
      if (mode === "create") {
        await createTeacherQuestion(examId, payload);
        toast.success("Đã tạo câu hỏi");
      } else if (questionId) {
        await updateTeacherQuestion(questionId, payload);
        toast.success("Đã cập nhật câu hỏi");
      }

      router.push(`/teacher/exams/${examId}/questions`);
      router.refresh();
    } catch (error) {
      mapApiErrorToForm(error, form.setError);

      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Không thể lưu câu hỏi");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="section"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="orderIndex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order index</FormLabel>
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
        </div>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung câu hỏi</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Lựa chọn</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Không gửi lựa chọn rỗng lên API.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ value: "" })}
            >
              <Plus className="h-4 w-4" />
              Thêm option
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3">
              <FormField
                control={form.control}
                name={`options.${index}.value`}
                render={({ field: optionField }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Option {index + 1}</FormLabel>
                    <FormControl>
                      <Input {...optionField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {fields.length > 2 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-8"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        <FormField
          control={form.control}
          name="correctAnswer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Đáp án đúng</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Nhập đúng nội dung hoặc label đáp án theo backend contract"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="explanation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giải thích</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Đang lưu..." : mode === "create" ? "Tạo câu hỏi" : "Lưu thay đổi"}
        </Button>
      </form>
    </Form>
  );
}
