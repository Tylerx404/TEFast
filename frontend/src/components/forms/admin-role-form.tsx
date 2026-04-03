"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateAdminUserRole } from "@/features/admin/users.client";
import { adminRoleSchema } from "@/features/admin/schemas";
import { ApiRequestError } from "@/lib/api/client";
import { mapApiErrorToForm } from "@/lib/forms/map-api-error-to-form";
import type { AdminRoleFormValues } from "@/types/forms";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminRoleForm({
  userId,
  initialValues,
}: {
  userId: string;
  initialValues: AdminRoleFormValues;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<AdminRoleFormValues>({
    resolver: zodResolver(adminRoleSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: AdminRoleFormValues) {
    setIsPending(true);

    try {
      await updateAdminUserRole(userId, values);
      toast.success("Đã cập nhật role");
      router.refresh();
    } catch (error) {
      mapApiErrorToForm(error, form.setError);

      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Không thể cập nhật role");
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
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="STUDENT">STUDENT</SelectItem>
                  <SelectItem value="TEACHER">TEACHER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Đang lưu..." : "Cập nhật role"}
        </Button>
      </form>
    </Form>
  );
}
