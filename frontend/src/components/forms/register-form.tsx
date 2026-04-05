"use client";

import Link from "next/link";
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
import { registerSchema } from "@/features/auth/schemas";
import type { RegisterFormValues } from "@/types/forms";

type RegisterResponse = {
  email: string;
  verificationEmailSent?: boolean;
};

export function RegisterForm() {
  const [isPending, setIsPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verificationEmailSent, setVerificationEmailSent] = useState(true);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsPending(true);

    try {
      const response = await proxyApiFetch<RegisterResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(values),
      });

      setRegisteredEmail(response.data.email);
      setVerificationEmailSent(response.data.verificationEmailSent !== false);
      form.reset();
      toast.success(response.message);
    } catch (error) {
      mapApiErrorToForm(error, form.setError);

      if (error instanceof ApiRequestError) {
        toast.error(error.message);
      } else {
        toast.error("Unable to register right now");
      }
    } finally {
      setIsPending(false);
    }
  }

  if (registeredEmail) {
    return (
      <div className="grid gap-5">
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 p-5 text-sm text-[hsl(var(--muted-foreground))]">
          <p className="text-base font-semibold text-[hsl(var(--foreground))]">
            {verificationEmailSent
              ? "Check your inbox if you want to verify later"
              : "Your account is ready even though the first email did not go out"}
          </p>
          <p className="mt-2">
            {verificationEmailSent ? (
              <>
                You can log in right away. A verification link was also sent to{" "}
                <span className="font-medium">{registeredEmail}</span>.
              </>
            ) : (
              <>
                You can log in right away. The verification email to{" "}
                <span className="font-medium">{registeredEmail}</span> could not be sent right now.
              </>
            )}
          </p>
          <p className="mt-2">
            {verificationEmailSent
              ? "Use it only if you want to confirm the email address later."
              : "Use resend verification after the mail service is ready again."}
          </p>
        </div>
        <Button asChild variant="secondary" className="w-full">
          <Link href={`/resend-verification?email=${encodeURIComponent(registeredEmail)}`}>
            Resend verification email
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Go to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className="grid gap-5" method="post" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Nguyen Van A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-5 md:grid-cols-2">
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input placeholder="0901234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password@123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password@123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  );
}
