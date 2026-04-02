import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Họ tên cần ít nhất 2 ký tự"),
    email: z.email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự"),
    confirmPassword: z.string().min(8, "Xác nhận mật khẩu là bắt buộc"),
    phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  fullName: z.string().min(2, "Họ tên cần ít nhất 2 ký tự"),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  avatarUrl: z.string(),
  targetExam: z.enum(["", "TOEIC", "IELTS"]),
});
