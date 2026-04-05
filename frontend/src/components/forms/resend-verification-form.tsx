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
import { resendVerificationSchema } from "@/features/auth/schemas";
import { proxyApiFetch, ApiRequestError } from "@/lib/api/client";
import { mapApiErrorToForm } from "@/lib/forms/map-api-error-to-form";
import type { ResendVerificationFormValues } from "@/types/forms";

export function ResendVerificationForm({ initialEmail }: { initialEmail?: string }) {
  const [isPending, setIsPending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = useForm<ResendVerificationFormValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: initialEmail ?? "",
    },
  });

  async function onSubmit(values: ResendVerificationFormValues) {
    setIsPending(true);

    try {
      const response = await proxyApiFetch<null>("/api/auth/resend-verification-email", {
        method: "POST",
        body: JSON.stringify(values),
      });

      setIsSubmitted(true);
      toast.success(response.message);
    } catch (error) {
      mapApiErrorToForm(error, form.setError);

      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Unable to resend verification email right now");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form className="grid gap-5" method="post" onSubmit={form.handleSubmit(onSubmit)}>
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
        {isSubmitted ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            If the account is still waiting for verification, a fresh link is on the way.
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Sending..." : "Resend verification email"}
        </Button>
      </form>
    </Form>
  );
}
