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
import { proxyApiFetch, ApiRequestError } from "@/lib/api/client";
import { mapApiErrorToForm } from "@/lib/forms/map-api-error-to-form";
import { loginSchema } from "@/features/auth/schemas";
import type { LoginFormValues } from "@/types/forms";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [isPending, setIsPending] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsPending(true);

    try {
      await proxyApiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });

      toast.success("Đăng nhập thành công");
      window.location.assign(redirectTo || "/my-courses");
    } catch (error) {
      mapApiErrorToForm(error, form.setError);

      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Không thể đăng nhập lúc này");
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="student1@tefast.vn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Password@123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>
    </Form>
  );
}
