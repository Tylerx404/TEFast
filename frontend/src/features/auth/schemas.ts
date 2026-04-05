import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email is invalid"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Email is invalid"),
});

export const resendVerificationSchema = z.object({
  email: z.email("Email is invalid"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must contain at least 2 characters"),
    email: z.email("Email is invalid"),
    password: z.string().min(8, "Password must contain at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
    phone: z.string().min(8, "Phone number is invalid"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Confirm password does not match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(8, "Password must contain at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Confirm password does not match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must contain at least 2 characters"),
  phone: z.string().min(8, "Phone number is invalid"),
  avatarUrl: z.string(),
  targetExam: z.enum(["", "TOEIC", "IELTS", "__NONE__"]),
});
