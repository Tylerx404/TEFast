"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { proxyApiFetch, ApiRequestError } from "@/lib/api/client";
import { mapApiErrorToForm } from "@/lib/forms/map-api-error-to-form";
import { profileSchema } from "@/features/auth/schemas";
import type { ProfileFormValues } from "@/types/forms";

const EMPTY_TARGET_EXAM = "__NONE__";

type ProfileFormStateValues = Omit<ProfileFormValues, "targetExam"> & {
  targetExam: ProfileFormValues["targetExam"] | typeof EMPTY_TARGET_EXAM;
};

export function ProfileForm({ initialValues }: { initialValues: ProfileFormValues }) {
  const [isPending, setIsPending] = useState(false);
  const form = useForm<ProfileFormStateValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      ...initialValues,
      targetExam: initialValues.targetExam || EMPTY_TARGET_EXAM,
    },
  });

  async function onSubmit(values: ProfileFormStateValues) {
    setIsPending(true);

    try {
      await proxyApiFetch("/api/proxy/users/profile", {
        method: "PATCH",
        body: JSON.stringify({
          ...values,
          targetExam:
            values.targetExam === EMPTY_TARGET_EXAM ? null : values.targetExam,
        }),
      });

      toast.success("Đã cập nhật hồ sơ");
    } catch (error) {
      mapApiErrorToForm(error, form.setError);

      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Không thể cập nhật hồ sơ");
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
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ tên</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <Input placeholder="/uploads/images/avatar.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="targetExam"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mục tiêu thi</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={EMPTY_TARGET_EXAM}>Chưa chọn</SelectItem>
                  <SelectItem value="TOEIC">TOEIC</SelectItem>
                  <SelectItem value="IELTS">IELTS</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </form>
    </Form>
  );
}
