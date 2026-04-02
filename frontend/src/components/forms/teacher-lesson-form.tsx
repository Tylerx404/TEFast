"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createTeacherLesson,
  updateTeacherLesson,
  updateTeacherLessonOrder,
} from "@/features/teacher/lessons";
import {
  teacherLessonOrderSchema,
  teacherLessonSchema,
} from "@/features/teacher/schemas";
import { ApiRequestError } from "@/lib/api/client";
import { mapApiErrorToForm } from "@/lib/forms/map-api-error-to-form";
import type { TeacherLessonFormValues } from "@/types/forms";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TeacherLessonFormProps = {
  mode: "create" | "edit";
  courseId: string;
  lessonId?: string;
  initialValues: TeacherLessonFormValues;
};

export function TeacherLessonForm({
  mode,
  courseId,
  lessonId,
  initialValues,
}: TeacherLessonFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<TeacherLessonFormValues>({
    resolver: zodResolver(teacherLessonSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: TeacherLessonFormValues) {
    setIsPending(true);

    const payload = {
      ...values,
      isPreview: values.isPreview === "true",
    };

    try {
      if (mode === "create") {
        await createTeacherLesson(courseId, payload);
        toast.success("Đã tạo bài học");
      } else if (lessonId) {
        await updateTeacherLesson(lessonId, payload);
        await updateTeacherLessonOrder(lessonId, {
          orderIndex: payload.orderIndex,
        });
        toast.success("Đã cập nhật bài học");
      }

      router.push(`/teacher/courses/${courseId}/lessons`);
      router.refresh();
    } catch (error) {
      mapApiErrorToForm(error, form.setError);

      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Không thể lưu bài học");
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiêu đề</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại nội dung" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="VIDEO">VIDEO</SelectItem>
                    <SelectItem value="TEXT">TEXT</SelectItem>
                    <SelectItem value="AUDIO">AUDIO</SelectItem>
                    <SelectItem value="FILE">FILE</SelectItem>
                  </SelectContent>
                </Select>
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
              <FormLabel>Nội dung / URL</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="attachmentUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attachment URL</FormLabel>
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
          name="isPreview"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preview</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái preview" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Preview</SelectItem>
                  <SelectItem value="false">Locked</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Đang lưu..." : mode === "create" ? "Tạo bài học" : "Lưu thay đổi"}
        </Button>
      </form>
    </Form>
  );
}

type TeacherLessonOrderFormProps = {
  lessonId: string;
  initialOrderIndex: number;
};

export function TeacherLessonOrderForm({
  lessonId,
  initialOrderIndex,
}: TeacherLessonOrderFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<{ orderIndex: number }>({
    resolver: zodResolver(teacherLessonOrderSchema),
    defaultValues: {
      orderIndex: initialOrderIndex,
    },
  });

  async function onSubmit(values: { orderIndex: number }) {
    setIsPending(true);

    try {
      await updateTeacherLessonOrder(lessonId, values);
      toast.success("Đã cập nhật thứ tự");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Không thể cập nhật thứ tự");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form
        className="flex items-center gap-2"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="orderIndex"
          render={({ field }) => (
            <FormItem className="w-24">
              <FormControl>
                <Input
                  type="number"
                  value={field.value}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button size="sm" type="submit" disabled={isPending}>
          {isPending ? "..." : "Lưu"}
        </Button>
      </form>
    </Form>
  );
}
